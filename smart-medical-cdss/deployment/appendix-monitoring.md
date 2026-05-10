# 附录A: 监控运维配置

## A.1 Prometheus监控配置

### A.1.1 Prometheus values.yaml

```yaml
# values-prometheus.yaml
fullnameOverride: cdss-prometheus

# 全局配置
global:
  scrape_interval: 30s
  evaluation_interval: 30s
  external_labels:
    cluster: cdss-prod
    replica: '{{.ExternalURL}}'

# Alertmanager配置
alertmanager:
  enabled: true
  
  config:
    global:
      smtp_smarthost: 'smtp.medical.com:587'
      smtp_from: 'alerts@medical.com'
      smtp_auth_username: 'alerts@medical.com'
      smtp_auth_password: '${SMTP_PASSWORD}'
      
      resolve_timeout: 5m
      
    route:
      group_by: ['alertname', 'severity', 'namespace']
      group_wait: 30s
      group_interval: 5m
      repeat_interval: 4h
      receiver: 'default'
      routes:
        - match:
            severity: critical
          receiver: 'pagerduty-critical'
          continue: true
        - match:
            severity: warning
          receiver: 'slack-warnings'
          continue: true
        - match:
            namespace: cdss-production
          receiver: 'cdss-team'
          
    receivers:
      - name: 'default'
        email_configs:
          - to: 'devops@medical.com'
            send_resolved: true
            
      - name: 'pagerduty-critical'
        pagerduty_configs:
          - service_key: '${PAGERDUTY_SERVICE_KEY}'
            severity: critical
            description: '{{ .CommonAnnotations.summary }}'
            
      - name: 'slack-warnings'
        slack_configs:
          - api_url: '${SLACK_WEBHOOK_URL}'
            channel: '#cdss-alerts'
            send_resolved: true
            title: '{{ template "slack.title" . }}'
            text: '{{ template "slack.text" . }}'
            
      - name: 'cdss-team'
        email_configs:
          - to: 'cdss-team@medical.com'
            send_resolved: true
            
    templates:
      - '/etc/alertmanager/templates/*.tmpl'
      
  # Alertmanager高可用
  replicaCount: 3
  
  # 持久化
  persistence:
    enabled: true
    storageClass: "fast-ssd"
    size: 10Gi
    
  # 资源限制
  resources:
    limits:
      cpu: "1000m"
      memory: "1Gi"
    requests:
      cpu: "500m"
      memory: "512Mi"

# 告警规则
prometheus:
  prometheusSpec:
    # 存储配置
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: fast-ssd
          resources:
            requests:
              storage: 500Gi
              
    # 保留策略
    retention: 30d
    retentionSize: "450GB"
    
    # 资源限制
    resources:
      limits:
        cpu: "8000m"
        memory: "32Gi"
      requests:
        cpu: "4000m"
        memory: "16Gi"
        
    # 副本数
    replicas: 2
    
    # 服务发现
    serviceMonitorSelectorNilUsesHelmValues: false
    serviceMonitorSelector: {}
    podMonitorSelectorNilUsesHelmValues: false
    podMonitorSelector: {}
    ruleSelectorNilUsesHelmValues: false
    ruleSelector: {}
    
    # 额外抓取配置
    additionalScrapeConfigs:
      # CDSS应用指标
      - job_name: 'cdss-applications'
        kubernetes_sd_configs:
          - role: pod
            namespaces:
              names:
                - cdss-production
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
            action: keep
            regex: true
          - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
            action: replace
            target_label: __metrics_path__
            regex: (.+)
          - source_labels: [__address__, __meta_kubernetes_pod_annotation_prometheus_io_port]
            action: replace
            regex: ([^:]+)(?::\d+)?;(\d+)
            replacement: $1:$2
            target_label: __address__
          - action: labelmap
            regex: __meta_kubernetes_pod_label_(.+)
          - source_labels: [__meta_kubernetes_namespace]
            action: replace
            target_label: kubernetes_namespace
          - source_labels: [__meta_kubernetes_pod_name]
            action: replace
            target_label: kubernetes_pod_name
            
      # PostgreSQL指标 (Postgres Exporter)
      - job_name: 'postgresql'
        static_configs:
          - targets: ['cdss-postgres-exporter:9187']
        
      # Redis指标 (Redis Exporter)
      - job_name: 'redis'
        static_configs:
          - targets: ['cdss-redis-exporter:9121']
          
      # Kafka指标 (Kafka Exporter)
      - job_name: 'kafka'
        static_configs:
          - targets: ['cdss-kafka-exporter:9308']
          
      # Elasticsearch指标
      - job_name: 'elasticsearch'
        static_configs:
          - targets: ['cdss-elasticsearch-exporter:9114']
      
      # NVIDIA GPU指标 (DCGM Exporter)
      - job_name: 'nvidia-dcgm'
        kubernetes_sd_configs:
          - role: pod
            selectors:
              - label: "app.kubernetes.io/name=dcgm-exporter"
        relabel_configs:
          - source_labels: [__meta_kubernetes_pod_ip]
            action: replace
            target_label: __address__
            regex: (.+)
            replacement: ${1}:9400

    # 告警规则
    ruleFiles:
      - /etc/prometheus/rules/*.yml
      
  # 告警规则定义
  ruleFiles:
    cdss-rules.yml: |
      groups:
        - name: cdss-alerts
          rules:
            # 高延迟告警
            - alert: CDSSHighLatency
              expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{job="cdss-applications"}[5m])) by (le, service)) > 1
              for: 5m
              labels:
                severity: warning
                namespace: cdss-production
              annotations:
                summary: "CDSS服务 {{ $labels.service }} 延迟过高"
                description: "95分位延迟为 {{ $value }}s，超过1秒阈值"
                
            # 高错误率告警
            - alert: CDSSErrorRate
              expr: sum(rate(http_requests_total{job="cdss-applications",status=~"5.."}[5m])) by (service) / sum(rate(http_requests_total{job="cdss-applications"}[5m])) by (service) > 0.01
              for: 5m
              labels:
                severity: critical
                namespace: cdss-production
              annotations:
                summary: "CDSS服务 {{ $labels.service }} 错误率过高"
                description: "错误率为 {{ $value | humanizePercentage }}，超过1%阈值"
                
            # 服务可用性告警
            - alert: CDSSServiceDown
              expr: up{job="cdss-applications"} == 0
              for: 1m
              labels:
                severity: critical
                namespace: cdss-production
              annotations:
                summary: "CDSS服务 {{ $labels.instance }} 宕机"
                description: "服务已宕机超过1分钟"
                
            # JVM内存告警
            - alert: CDSSJvmMemoryHigh
              expr: jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} > 0.85
              for: 5m
              labels:
                severity: warning
                namespace: cdss-production
              annotations:
                summary: "CDSS服务 {{ $labels.service }} JVM堆内存使用率过高"
                description: "堆内存使用率为 {{ $value | humanizePercentage }}"
                
            # 数据库连接池告警
            - alert: CDSSDatabaseConnectionsHigh
              expr: hikaricp_connections_active / hikaricp_connections_max > 0.85
              for: 5m
              labels:
                severity: warning
                namespace: cdss-production
              annotations:
                summary: "CDSS服务 {{ $labels.service }} 数据库连接池使用率过高"
                description: "连接池使用率为 {{ $value | humanizePercentage }}"
                
            # PostgreSQL告警
            - alert: PostgreSQLDown
              expr: pg_up == 0
              for: 1m
              labels:
                severity: critical
              annotations:
                summary: "PostgreSQL实例 {{ $labels.instance }} 宕机"
                
            - alert: PostgreSQLReplicationLag
              expr: pg_replication_lag > 300
              for: 5m
              labels:
                severity: warning
              annotations:
                summary: "PostgreSQL复制延迟过高"
                description: "复制延迟为 {{ $value }} 秒"
                
            # Redis告警
            - alert: RedisDown
              expr: redis_up == 0
              for: 1m
              labels:
                severity: critical
              annotations:
                summary: "Redis实例 {{ $labels.instance }} 宕机"
                
            - alert: RedisMemoryHigh
              expr: redis_memory_used_bytes / redis_memory_max_bytes > 0.9
              for: 5m
              labels:
                severity: warning
              annotations:
                summary: "Redis内存使用率过高"
                
            # Elasticsearch告警
            - alert: ElasticsearchClusterHealthRed
              expr: elasticsearch_cluster_health_status{color="red"} == 1
              for: 1m
              labels:
                severity: critical
              annotations:
                summary: "Elasticsearch集群状态为Red"
                
            - alert: ElasticsearchDiskWatermarkHigh
              expr: elasticsearch_filesystem_data_available_bytes / elasticsearch_filesystem_data_size_bytes < 0.2
              for: 5m
              labels:
                severity: warning
              annotations:
                summary: "Elasticsearch磁盘水位过高"
                
            # GPU告警
            - alert: GPUUtilizationHigh
              expr: DCGM_FI_DEV_GPU_UTIL > 95
              for: 10m
              labels:
                severity: warning
              annotations:
                summary: "GPU {{ $labels.gpu }} 利用率持续过高"
                
            - alert: GPUTemperatureHigh
              expr: DCGM_FI_DEV_GPU_TEMP > 85
              for: 5m
              labels:
                severity: critical
              annotations:
                summary: "GPU {{ $labels.gpu }} 温度过高"

# Grafana配置
grafana:
  enabled: true
  replicas: 2
  
  image:
    repository: grafana/grafana
    tag: "10.2.3"
  
  persistence:
    enabled: true
    storageClassName: fast-ssd
    size: 50Gi
  
  resources:
    limits:
      cpu: "2000m"
      memory: "4Gi"
    requests:
      cpu: "1000m"
      memory: "2Gi"
  
  # 管理员密码
  admin:
    existingSecret: "grafana-admin-credentials"
    userKey: admin-user
    passwordKey: admin-password
  
  # 数据源配置
  datasources:
    datasources.yaml:
      apiVersion: 1
      datasources:
        - name: Prometheus
          type: prometheus
          url: http://cdss-prometheus-server:9090
          access: proxy
          isDefault: true
          jsonData:
            timeInterval: "30s"
            httpMethod: POST
            manageAlerts: true
            alertmanagerUid: alertmanager
            
        - name: Loki
          type: loki
          url: http://cdss-loki:3100
          access: proxy
          jsonData:
            maxLines: 1000
            
        - name: Tempo
          type: tempo
          url: http://cdss-tempo:3100
          access: proxy
          jsonData:
            httpMethod: GET
            
        - name: Alertmanager
          type: alertmanager
          url: http://cdss-prometheus-alertmanager:9093
          access: proxy
          uid: alertmanager
          jsonData:
            implementation: prometheus
            
        - name: Jaeger
          type: jaeger
          url: http://cdss-jaeger-query:16686
          access: proxy
          
  # Dashboards
  dashboardProviders:
    dashboardproviders.yaml:
      apiVersion: 1
      providers:
        - name: 'cdss'
          orgId: 1
          folder: 'CDSS'
          type: file
          disableDeletion: false
          editable: true
          options:
            path: /var/lib/grafana/dashboards/cdss
        - name: 'kubernetes'
          orgId: 1
          folder: 'Kubernetes'
          type: file
          disableDeletion: false
          editable: true
          options:
            path: /var/lib/grafana/dashboards/kubernetes
        - name: 'infrastructure'
          orgId: 1
          folder: 'Infrastructure'
          type: file
          disableDeletion: false
          editable: true
          options:
            path: /var/lib/grafana/dashboards/infrastructure
            
  dashboards:
    cdss:
      cdss-overview:
        gnetId: 1860
        revision: 27
        datasource: Prometheus
      cdss-api-gateway:
        url: https://raw.githubusercontent.com/medical/cdss-dashboards/main/api-gateway.json
      cdss-core-engine:
        url: https://raw.githubusercontent.com/medical/cdss-dashboards/main/core-engine.json
      cdss-knowledge-base:
        url: https://raw.githubusercontent.com/medical/cdss-dashboards/main/knowledge-base.json
      cdss-nlp-service:
        url: https://