export interface User {
  id: string;
  username: string;
  name: string;
  role: 'doctor' | 'nurse' | 'admin' | 'pharmacist';
  department: string;
  avatar?: string;
}

export interface Patient {
  id: string;
  admissionNo: string;
  name: string;
  gender: '男' | '女';
  age: number;
  department: string;
  status: '住院中' | '门诊' | '出院';
  phone: string;
  bloodType?: string;
  allergies?: string[];
  admissionDate: string;
  bedNo?: string;
  diagnosis?: string;
}

export interface Encounter {
  id: string;
  patientId: string;
  patientName: string;
  encounterType: '门诊' | '住院' | '急诊';
  department: string;
  doctorId: string;
  doctorName: string;
  admissionDate: string;
  dischargeDate?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  status: '进行中' | '已完成' | '已取消';
}

export interface DiagnosisRecord {
  id: string;
  encounterId: string;
  patientId: string;
  diagnosisCode: string;
  diagnosisName: string;
  diagnosisType: '主要诊断' | '次要诊断' | '并发症';
  confidence?: number;
  evidenceSource?: 'LLM' | 'KG' | 'RULE' | 'HYBRID';
  createdAt: string;
  doctorId: string;
  doctorName: string;
}

export interface MedicationRecord {
  id: string;
  encounterId: string;
  patientId: string;
  drugName: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  prescriber: string;
  status: '使用中' | '已停用' | '已完成';
}

export interface LabResult {
  id: string;
  encounterId: string;
  patientId: string;
  testName: string;
  testCode: string;
  value: number;
  unit: string;
  referenceRange: string;
  lowBound: number;
  highBound: number;
  isAbnormal: boolean;
  isCritical: boolean;
  direction?: 'high' | 'low';
  testDate: string;
  category: string;
  clinicalSignificance?: string;
}

export interface DecisionSuggestion {
  id: string;
  diseaseName: string;
  icdCode: string;
  confidence: number;
  evidenceSource: 'LLM' | 'KG' | 'RULE' | 'HYBRID';
  evidence: string[];
  description: string;
  relatedSymptoms: string[];
}

export interface MedicationWarning {
  id: string;
  drugA: string;
  drugB: string;
  severity: '禁忌' | '严重' | '警告' | '注意';
  interactionType: string;
  description: string;
  recommendation: string;
  evidence: string;
}

export interface KnowledgeItem {
  id: string;
  type: '疾病' | '药品' | '指南' | '检查';
  title: string;
  keywords: string[];
  summary: string;
  source: string;
  content?: string;
  relatedItems?: string[];
  updatedAt: string;
}

export interface DashboardStats {
  todayEncounters: number;
  pendingReviews: number;
  alertCount: number;
  aiAssistCount: number;
  todayEncountersTrend: number;
  pendingReviewsTrend: number;
  alertCountTrend: number;
  aiAssistCountTrend: number;
}

export interface Alert {
  id: string;
  type: '用药预警' | '诊断提醒' | '检验异常' | '质控提醒';
  severity: '红' | '橙' | '黄' | '蓝';
  title: string;
  description: string;
  patientName?: string;
  patientId?: string;
  createdAt: string;
  isRead: boolean;
}

export interface TreatmentPlan {
  id: string;
  diseaseName: string;
  guidelineSource: string;
  medicationPlan: string;
  precautions: string;
  followUpSchedule: string;
  adjustmentSuggestions?: string;
  confidence: number;
}

export interface QualityCheck {
  id: string;
  category: string;
  problem: string;
  severity: '高' | '中' | '低';
  suggestion: string;
  status: '未处理' | '已处理' | '已忽略';
  patientName?: string;
  encounterId?: string;
}

export interface QualityScore {
  overall: number;
  diagnosis: number;
  medication: number;
  documentation: number;
  timeliness: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
