import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, AlertCircle, User as UserIcon } from 'lucide-react';
import type { Patient, DiagnosisRecord, MedicationRecord, LabResult, Encounter } from '@/types';

const mockPatient: Patient = {
  id: '1', admissionNo: 'ZY20240001', name: '李某某', gender: '男', age: 65,
  department: '心内科', status: '住院中', phone: '138****1234', bloodType: 'A+',
  allergies: ['青霉素', '碘造影剂'], admissionDate: '2024-01-15', bedNo: 'A-301',
  diagnosis: '急性心肌梗死',
};

const mockEncounters: Encounter[] = [
  { id: 'E1', patientId: '1', patientName: '李某某', encounterType: '住院', department: '心内科', doctorId: 'D1', doctorName: '张医生', admissionDate: '2024-01-15', chiefComplaint: '胸痛3小时', diagnosis: '急性心肌梗死', status: '进行中' },
  { id: 'E2', patientId: '1', patientName: '李某某', encounterType: '门诊', department: '心内科', doctorId: 'D1', doctorName: '张医生', admissionDate: '2024-01-10', chiefComplaint: '胸闷', diagnosis: '冠心病', status: '已完成' },
];

const mockDiagnoses: DiagnosisRecord[] = [
  { id: 'D1', encounterId: 'E1', patientId: '1', diagnosisCode: 'I21.0', diagnosisName: '急性透壁性前壁心肌梗死', diagnosisType: '主要诊断', confidence: 0.92, evidenceSource: 'HYBRID', createdAt: '2024-01-15', doctorId: 'D1', doctorName: '张医生' },
  { id: 'D2', encounterId: 'E1', patientId: '1', diagnosisCode: 'I10', diagnosisName: '原发性高血压', diagnosisType: '次要诊断', createdAt: '2024-01-15', doctorId: 'D1', doctorName: '张医生' },
  { id: 'D3', encounterId: 'E1', patientId: '1', diagnosisCode: 'E11.9', diagnosisName: '2型糖尿病', diagnosisType: '次要诊断', createdAt: '2024-01-15', doctorId: 'D1', doctorName: '张医生' },
];

const mockMedications: MedicationRecord[] = [
  { id: 'M1', encounterId: 'E1', patientId: '1', drugName: '阿司匹林肠溶片', dosage: '100mg', frequency: '每日一次', route: '口服', startDate: '2024-01-15', prescriber: '张医生', status: '使用中' },
  { id: 'M2', encounterId: 'E1', patientId: '1', drugName: '氯吡格雷片', dosage: '75mg', frequency: '每日一次', route: '口服', startDate: '2024-01-15', prescriber: '张医生', status: '使用中' },
  { id: 'M3', encounterId: 'E1', patientId: '1', drugName: '阿托伐他汀钙片', dosage: '20mg', frequency: '每晚一次', route: '口服', startDate: '2024-01-15', prescriber: '张医生', status: '使用中' },
  { id: 'M4', encounterId: 'E1', patientId: '1', drugName: '美托洛尔缓释片', dosage: '47.5mg', frequency: '每日一次', route: '口服', startDate: '2024-01-15', prescriber: '张医生', status: '使用中' },
];

const mockLabResults: LabResult[] = [
  { id: 'L1', encounterId: 'E1', patientId: '1', testName: '肌钙蛋白I', testCode: 'cTnI', value: 5.8, unit: 'ng/mL', referenceRange: '0-0.04', lowBound: 0, highBound: 0.04, isAbnormal: true, isCritical: true, direction: 'high', testDate: '2024-01-15', category: '心肌标志物', clinicalSignificance: '显著升高，提示急性心肌损伤' },
  { id: 'L2', encounterId: 'E1', patientId: '1', testName: 'CK-MB', testCode: 'CKMB', value: 85, unit: 'U/L', referenceRange: '0-25', lowBound: 0, highBound: 25, isAbnormal: true, isCritical: false, direction: 'high', testDate: '2024-01-15', category: '心肌标志物', clinicalSignificance: '升高，提示心肌损伤' },
  { id: 'L3', encounterId: 'E1', patientId: '1', testName: '血红蛋白', testCode: 'HGB', value: 128, unit: 'g/L', referenceRange: '120-160', lowBound: 120, highBound: 160, isAbnormal: false, isCritical: false, testDate: '2024-01-15', category: '血常规' },
  { id: 'L4', encounterId: 'E1', patientId: '1', testName: '血钾', testCode: 'K', value: 3.2, unit: 'mmol/L', referenceRange: '3.5-5.3', lowBound: 3.5, highBound: 5.3, isAbnormal: true, isCritical: false, direction: 'low', testDate: '2024-01-15', category: '电解质', clinicalSignificance: '轻度低钾血症，需关注' },
];

type TabKey = 'encounters' | 'diagnoses' | 'medications' | 'labs';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'encounters', label: '就诊记录' },
  { key: 'diagnoses', label: '诊断记录' },
  { key: 'medications', label: '用药记录' },
  { key: 'labs', label: '检查检验' },
];

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('encounters');

  const patient = mockPatient;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/patients')} className="p-1.5 rounded hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <h2 className="text-lg font-semibold text-slate-800">患者详情</h2>
      </div>

      <div className="bg-white rounded-lg border border-slate-100 p-5">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-sky-50 rounded-full flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-8 h-8 text-sky-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-bold text-slate-800">{patient.name}</h3>
              <span className="text-sm text-slate-500">{patient.gender} · {patient.age}岁</span>
              <span className="text-xs px-2 py-0.5 bg-sky-50 text-sky-600 rounded">{patient.status}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-slate-400">住院号</span>
                <p className="text-slate-700 font-mono">{patient.admissionNo}</p>
              </div>
              <div>
                <span className="text-slate-400">科室/床号</span>
                <p className="text-slate-700">{patient.department} {patient.bedNo}</p>
              </div>
              <div>
                <span className="text-slate-400">入院日期</span>
                <p className="text-slate-700">{patient.admissionDate}</p>
              </div>
              <div>
                <span className="text-slate-400">诊断</span>
                <p className="text-slate-700">{patient.diagnosis}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-50">
              <div className="flex items-center gap-1.5 text-sm">
                <Droplets className="w-4 h-4 text-red-400" />
                <span className="text-slate-400">血型:</span>
                <span className="text-slate-700 font-medium">{patient.bloodType}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-slate-400">过敏:</span>
                <div className="flex gap-1">
                  {patient.allergies?.map((a) => (
                    <span key={a} className="px-1.5 py-0.5 bg-orange-50 text-orange-600 text-xs rounded">{a}</span>
                  ))}
                  {(!patient.allergies || patient.allergies.length === 0) && <span className="text-slate-500">无</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-100">
        <div className="flex border-b border-slate-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.key ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500" />}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'encounters' && (
            <div className="space-y-3">
              {mockEncounters.map((enc) => (
                <div key={enc.id} className="p-4 border border-slate-100 rounded-lg hover:border-sky-200 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${enc.encounterType === '住院' ? 'bg-sky-50 text-sky-600' : enc.encounterType === '急诊' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {enc.encounterType}
                      </span>
                      <span className="text-sm font-medium text-slate-800">{enc.department}</span>
                    </div>
                    <span className="text-xs text-slate-400">{enc.admissionDate}</span>
                  </div>
                  <p className="text-sm text-slate-600">主诉: {enc.chiefComplaint}</p>
                  <p className="text-sm text-slate-500 mt-1">诊断: {enc.diagnosis} · {enc.doctorName}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'diagnoses' && (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-50">
                  <th className="text-left py-2 font-medium">诊断类型</th>
                  <th className="text-left py-2 font-medium">诊断名称</th>
                  <th className="text-left py-2 font-medium">ICD-10</th>
                  <th className="text-left py-2 font-medium">置信度</th>
                  <th className="text-left py-2 font-medium">来源</th>
                </tr>
              </thead>
              <tbody>
                {mockDiagnoses.map((d) => (
                  <tr key={d.id} className="border-b border-slate-50">
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${d.diagnosisType === '主要诊断' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                        {d.diagnosisType}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-800">{d.diagnosisName}</td>
                    <td className="py-3 text-sm text-slate-500 font-mono">{d.diagnosisCode}</td>
                    <td className="py-3">
                      {d.confidence ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 rounded-full" style={{ width: `${d.confidence * 100}%` }} />
                          </div>
                          <span className="text-xs text-slate-500">{(d.confidence * 100).toFixed(0)}%</span>
                        </div>
                      ) : <span className="text-xs text-slate-300">-</span>}
                    </td>
                    <td className="py-3">
                      {d.evidenceSource ? (
                        <span className="text-xs px-1.5 py-0.5 bg-violet-50 text-violet-600 rounded">{d.evidenceSource}</span>
                      ) : <span className="text-xs text-slate-300">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'medications' && (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-50">
                  <th className="text-left py-2 font-medium">药品名称</th>
                  <th className="text-left py-2 font-medium">剂量</th>
                  <th className="text-left py-2 font-medium">频次</th>
                  <th className="text-left py-2 font-medium">用法</th>
                  <th className="text-left py-2 font-medium">开始日期</th>
                  <th className="text-left py-2 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {mockMedications.map((m) => (
                  <tr key={m.id} className="border-b border-slate-50">
                    <td className="py-3 text-sm text-slate-800 font-medium">{m.drugName}</td>
                    <td className="py-3 text-sm text-slate-600">{m.dosage}</td>
                    <td className="py-3 text-sm text-slate-600">{m.frequency}</td>
                    <td className="py-3 text-sm text-slate-600">{m.route}</td>
                    <td className="py-3 text-sm text-slate-400">{m.startDate}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${m.status === '使用中' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'labs' && (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-50">
                  <th className="text-left py-2 font-medium">检查项目</th>
                  <th className="text-left py-2 font-medium">结果</th>
                  <th className="text-left py-2 font-medium">参考范围</th>
                  <th className="text-left py-2 font-medium">分类</th>
                  <th className="text-left py-2 font-medium">临床意义</th>
                </tr>
              </thead>
              <tbody>
                {mockLabResults.map((l) => (
                  <tr key={l.id} className={`border-b border-slate-50 ${l.isCritical ? 'bg-red-50' : ''}`}>
                    <td className="py-3 text-sm text-slate-800">{l.testName}</td>
                    <td className="py-3 text-sm">
                      <span className={l.isAbnormal ? (l.direction === 'high' ? 'text-red-600 font-medium' : 'text-blue-600 font-medium') : 'text-slate-700'}>
                        {l.value} {l.unit}
                        {l.direction === 'high' && <span className="text-red-500 ml-1">↑</span>}
                        {l.direction === 'low' && <span className="text-blue-500 ml-1">↓</span>}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-400">{l.referenceRange} {l.unit}</td>
                    <td className="py-3 text-xs text-slate-500">{l.category}</td>
                    <td className="py-3 text-xs text-slate-500">{l.clinicalSignificance || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
