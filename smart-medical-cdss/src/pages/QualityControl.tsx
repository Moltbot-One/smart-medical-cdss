import { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { GaugeChart, BarChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { QualityCheck, QualityScore } from '@/types';

echarts.use([GaugeChart, BarChart, TooltipComponent, LegendComponent, CanvasRenderer]);

const mockScore: QualityScore = {
  overall: 87,
  diagnosis: 92,
  medication: 85,
  documentation: 78,
  timeliness: 90,
};

const mockChecks: QualityCheck[] = [
  { id: '1', category: '病历书写', problem: '体格检查记录不完整', severity: '高', suggestion: '补充完整的体格检查记录，包括生命体征和系统查体', status: '未处理', patientName: '李某某', encounterId: 'E1' },
  { id: '2', category: '用药合理性', problem: '阿司匹林与华法林联用未记录理由', severity: '高', suggestion: '记录双联抗血小板/抗凝治疗的适应症和风险评估', status: '未处理', patientName: '李某某', encounterId: 'E1' },
  { id: '3', category: '诊断规范', problem: '次要诊断缺少ICD编码', severity: '中', suggestion: '为所有诊断补充标准ICD-10编码', status: '未处理', patientName: '王某某', encounterId: 'E2' },
  { id: '4', category: '病历书写', problem: '入院记录超时未完成', severity: '中', suggestion: '入院记录应在入院24小时内完成', status: '已处理', patientName: '赵某某', encounterId: 'E4' },
  { id: '5', category: '检验合理性', problem: '重复检查项目', severity: '低', suggestion: '避免短期内重复开具相同检查项目', status: '已忽略', patientName: '张某某', encounterId: 'E3' },
  { id: '6', category: '用药合理性', problem: '抗生素使用指征不明确', severity: '中', suggestion: '补充抗生素使用指征，完善病原学检查', status: '未处理', patientName: '赵某某', encounterId: 'E4' },
];

const severityColor: Record<string, string> = {
  '高': 'bg-red-50 text-red-600 border-red-200',
  '中': 'bg-orange-50 text-orange-600 border-orange-200',
  '低': 'bg-yellow-50 text-yellow-600 border-yellow-200',
};

const severityDot: Record<string, string> = {
  '高': 'bg-red-500',
  '中': 'bg-orange-500',
  '低': 'bg-yellow-500',
};

const statusIcon: Record<string, React.ReactNode> = {
  '未处理': <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />,
  '已处理': <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
  '已忽略': <XCircle className="w-3.5 h-3.5 text-slate-400" />,
};

export default function QualityControl() {
  const [checks, setChecks] = useState(mockChecks);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? checks : checks.filter((c) => c.status === filter);

  const handleStatusChange = (id: string, status: '已处理' | '已忽略') => {
    setChecks((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
  };

  const gaugeOption = {
    series: [{
      type: 'gauge' as const,
      startAngle: 200,
      endAngle: -20,
      min: 0,
      max: 100,
      splitNumber: 10,
      itemStyle: { color: '#0ea5e9' },
      progress: { show: true, width: 18 },
      pointer: { show: false },
      axisLine: { lineStyle: { width: 18, color: [[1, '#e2e8f0']] } },
      axisTick: { show: false },
      splitLine: { show: false },
      axisLabel: { show: false },
      title: { fontSize: 14, color: '#64748b', offsetCenter: [0, '70%'] },
      detail: { valueAnimation: true, fontSize: 36, fontWeight: 'bold', color: '#0ea5e9', offsetCenter: [0, '30%'], formatter: '{value}' },
      data: [{ value: mockScore.overall, name: '综合评分' }],
    }],
  };

  const barOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: ['诊断规范', '用药合理', '病历书写', '时效性'],
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#94a3b8', fontSize: 12 },
    },
    yAxis: {
      type: 'value' as const,
      max: 100,
      axisLine: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
      axisLabel: { color: '#94a3b8', fontSize: 12 },
    },
    series: [{
      type: 'bar' as const,
      data: [
        { value: mockScore.diagnosis, itemStyle: { color: '#0ea5e9' } },
        { value: mockScore.medication, itemStyle: { color: '#06b6d4' } },
        { value: mockScore.documentation, itemStyle: { color: '#f97316' } },
        { value: mockScore.timeliness, itemStyle: { color: '#14b8a6' } },
      ],
      barWidth: 36,
      itemStyle: { borderRadius: [4, 4, 0, 0] },
    }],
  };

  const unhandledCount = checks.filter((c) => c.status === '未处理').length;
  const highCount = checks.filter((c) => c.severity === '高' && c.status === '未处理').length;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-slate-800">病历质控</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-slate-100 p-5 flex flex-col items-center">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 self-start">质量评分</h3>
          <ReactEChartsCore echarts={echarts} option={gaugeOption} style={{ height: 200 }} />
        </div>

        <div className="bg-white rounded-lg border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">分项评分</h3>
          <ReactEChartsCore echarts={echarts} option={barOption} style={{ height: 200 }} />
        </div>

        <div className="bg-white rounded-lg border border-slate-100 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">质控概览</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700">高优先级问题</span>
              </div>
              <span className="text-lg font-bold text-red-600">{highCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-md">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-700">待处理问题</span>
              </div>
              <span className="text-lg font-bold text-orange-600">{unhandledCount}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-700">已处理问题</span>
              </div>
              <span className="text-lg font-bold text-green-600">{checks.filter((c) => c.status === '已处理').length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-50">
          <h3 className="text-sm font-semibold text-slate-700">问题列表</h3>
          <div className="flex items-center gap-2">
            {['all', '未处理', '已处理', '已忽略'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  filter === f ? 'bg-sky-50 text-sky-600 border border-sky-200' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {f === 'all' ? '全部' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">暂无匹配的质控问题</div>
          ) : (
            filtered.map((check) => (
              <div key={check.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`w-2 h-2 rounded-full ${severityDot[check.severity]}`} />
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${severityColor[check.severity]}`}>
                        {check.severity}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 bg-slate-50 text-slate-500 rounded">{check.category}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-400">{check.patientName}</span>
                    </div>
                    <p className="text-sm text-slate-800 font-medium">{check.problem}</p>
                    <p className="text-xs text-slate-500 mt-1">建议: {check.suggestion}</p>
                  </div>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    {check.status === '未处理' ? (
                      <>
                        <button
                          onClick={() => handleStatusChange(check.id, '已处理')}
                          className="px-3 py-1 text-xs bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                        >
                          已处理
                        </button>
                        <button
                          onClick={() => handleStatusChange(check.id, '已忽略')}
                          className="px-3 py-1 text-xs bg-slate-50 text-slate-500 rounded-md hover:bg-slate-100 transition-colors"
                        >
                          忽略
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        {statusIcon[check.status]}
                        {check.status}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
