## 1. 架构设计

```mermaid
graph TB
    subgraph "前端层 Frontend"
        F1["React 18 + TypeScript"]
        F2["Tailwind CSS"]
        F3["Zustand 状态管理"]
        F4["ECharts 可视化"]
    end

    subgraph "后端层 Backend"
        B1["Express.js API网关"]
        B2["认证授权中间件"]
        B3["业务逻辑服务"]
        B4["数据访问层"]
    end

    subgraph "AI推理层 AI Service"
        A1["诊断推理引擎"]
        A2["用药审核引擎"]
        A3["知识图谱模拟"]
        A4["规则引擎模拟"]
    end

    subgraph "数据层 Data"
        D1["SQLite 主业务库"]
        D2["内存缓存"]
    end

    F1 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> B4
    B4 --> D1
    B3 --> A1
    B3 --> A2
    A1 --> A3
    A1 --> A4
    B3 --> D2
```

## 2. 技术说明

- **前端**: React@18 + TypeScript + Tailwind CSS@3 + Vite
- **初始化工具**: vite-init (react-express-ts 模板)
- **后端**: Express@4 + TypeScript
- **数据库**: SQLite (better-sqlite3)，开发阶段使用Mock数据
- **状态管理**: Zustand
- **可视化**: ECharts
- **图标**: lucide-react

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| /login | 登录页面 |
| / | 工作台首页（数据概览） |
| /patients | 患者管理列表 |
| /patients/:id | 患者详情 |
| /diagnosis | 智能诊断辅助 |
| /diagnosis/:encounterId | 诊断结果详情 |
| /medication | 用药决策支持 |
| /lab-results | 检查检验辅助 |
| /treatment | 治疗方案推荐 |
| /quality-control | 病历质控引擎 |
| /knowledge | 知识库管理 |

## 4. API定义

### 4.1 认证API

```typescript
POST /api/auth/login
Request: { username: string; password: string }
Response: { token: string; user: UserInfo }

POST /api/auth/logout
Response: { success: boolean }

GET /api/auth/me
Response: UserInfo
```

### 4.2 患者API

```typescript
GET /api/patients?page=1&size=20&search=&department=
Response: { list: Patient[]; total: number }

GET /api/patients/:id
Response: PatientDetail

GET /api/patients/:id/encounters
Response: Encounter[]

GET /api/patients/:id/medications
Response: Medication[]
```

### 4.3 诊断API

```typescript
POST /api/diagnosis/suggest
Request: { patientId: number; symptoms: string[]; chiefComplaint: string; medicalHistory: string }
Response: DiagnosisSuggestion[]

POST /api/diagnosis/:suggestionId/accept
Response: { success: boolean }

POST /api/diagnosis/:suggestionId/feedback
Request: { accepted: boolean; comment: string }
Response: { success: boolean }
```

### 4.4 用药API

```typescript
POST /api/medication/check
Request: { patientId: number; medications: MedicationInput[] }
Response: MedicationWarning[]

GET /api/medication/interactions?drug1=&drug2=
Response: DrugInteraction[]
```

### 4.5 检查检验API

```typescript
GET /api/lab-results/:encounterId
Response: LabResult[]

POST /api/lab-results/interpret
Request: { results: LabResultInput[] }
Response: LabInterpretation[]
```

### 4.6 知识库API

```typescript
GET /api/knowledge/search?q=&type=&page=1&size=20
Response: { list: KnowledgeItem[]; total: number }

GET /api/knowledge/:id
Response: KnowledgeDetail
```

### 4.7 仪表盘API

```typescript
GET /api/dashboard/stats
Response: DashboardStats

GET /api/dashboard/alerts
Response: Alert[]

GET /api/dashboard/recent-encounters
Response: EncounterSummary[]
```

## 5. 服务端架构图

```mermaid
graph LR
    C["Controller<br/>路由处理"] --> S["Service<br/>业务逻辑"]
    S --> R["Repository<br/>数据访问"]
    R --> D["SQLite<br/>数据库"]
    S --> AI["AI Engine<br/>推理引擎"]
    S --> Cache["Cache<br/>内存缓存"]
```

## 6. 数据模型

### 6.1 数据模型定义

```mermaid
erDiagram
    Patient ||--o{ Encounter : "就诊记录"
    Encounter ||--o{ Diagnosis : "诊断记录"
    Encounter ||--o{ Medication : "用药记录"
    Encounter ||--o{ LabResult : "检查检验"
    Encounter ||--o{ DecisionSuggestion : "决策建议"
    Patient {
        int id PK
        string medical_record_no
        string name
        int gender
        date birth_date
        string phone
        string id_card_no
        int blood_type
    }
    Encounter {
        int id PK
        int patient_id FK
        int encounter_type
        string visit_no
        int department_id
        int doctor_id
        string chief_complaint
        datetime admission_time
        int status
    }
    Diagnosis {
        int id PK
        int encounter_id FK
        int patient_id FK
        int diagnosis_type
        string icd10_code
        string icd10_name
        float confidence
        int source_type
        boolean is_confirmed
    }
    Medication {
        int id PK
        int encounter_id FK
        int patient_id FK
        string drug_code
        string drug_name
        string dosage
        string frequency
        string route
        int status
        json warnings
    }
    LabResult {
        int id PK
        int encounter_id FK
        int patient_id FK
        string test_name
        float result_value
        string unit
        float reference_min
        float reference_max
        boolean is_abnormal
        boolean is_critical
    }
    DecisionSuggestion {
        int id PK
        int encounter_id FK
        int patient_id FK
        int suggestion_type
        string title
        text content
        json evidence
        float confidence
        string source
        int priority
        boolean is_accepted
    }
```

### 6.2 数据定义语言

```sql
CREATE TABLE t_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_patient (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    medical_record_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    gender INTEGER NOT NULL,
    birth_date DATE NOT NULL,
    phone VARCHAR(20),
    id_card_no VARCHAR(18),
    blood_type INTEGER,
    address TEXT,
    allergies TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_encounter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    encounter_type INTEGER NOT NULL,
    visit_no VARCHAR(50) UNIQUE NOT NULL,
    department_id INTEGER,
    doctor_id INTEGER,
    chief_complaint TEXT,
    admission_time DATETIME,
    discharge_time DATETIME,
    status INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_diagnosis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    encounter_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    diagnosis_type INTEGER NOT NULL,
    icd10_code VARCHAR(20),
    icd10_name VARCHAR(200),
    diagnosis_desc TEXT,
    confidence REAL,
    source_type INTEGER,
    is_confirmed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_medication (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    encounter_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    drug_code VARCHAR(50),
    drug_name VARCHAR(200) NOT NULL,
    specification VARCHAR(100),
    dosage VARCHAR(50),
    frequency VARCHAR(50),
    route VARCHAR(50),
    status INTEGER DEFAULT 1,
    warnings TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_lab_result (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    encounter_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    test_name VARCHAR(200) NOT NULL,
    result_value REAL,
    unit VARCHAR(30),
    reference_min REAL,
    reference_max REAL,
    is_abnormal INTEGER DEFAULT 0,
    is_critical INTEGER DEFAULT 0,
    test_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_decision_suggestion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    encounter_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    suggestion_type INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    evidence TEXT,
    confidence REAL,
    source VARCHAR(50),
    priority INTEGER,
    is_accepted INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE t_knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    knowledge_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT,
    icd10_codes TEXT,
    source VARCHAR(100),
    evidence_level INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
