import { useState, useEffect } from 'react';
import { Brain, AlertTriangle, Check, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import type { DecisionSuggestion } from '@/types';

const commonSymptoms = [
  '胸痛', '胸闷', '气短', '咳嗽', '发热', '头痛', '头晕',
  '恶心', '呕吐', '腹痛', '腹泻', '乏力', '心悸', '水肿',
  '血尿', '少尿', '黄疸', '皮疹', '关节痛', '腰痛',
];

interface PatientOption {
  id: string;
  name: string;
  medical_record_no: string;
}

interface DiagnosisSuggestionRaw {
  id: string;
  icd10_code: string;
  icd10_name: string;
  confidence: number;
  evidence: string[];
  source: string;
  description: string;
  related_symptoms: string[];
  suggested_exams?: string[];
}

const sourceColor: Record<string, string> = {
  LLM: 'bg-violet-50 text-violet-600',
  KG: 'bg-green-50 text-green-600',
  RULE: 'bg-orange-50 text-orange-600',
  HYBRID: 'bg-sky-50 text-sky-600',
};

const sourceLabel: Record<string, string> = {
  LLM: '大语言模型',
  KG: '知识图谱',
  RULE: '规则引擎',
  HYBRID: '混合推理',
};

export default function Diagnosis() {
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [patient, setPatient] = useState('');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [medicalHistory, setMedicalHistory] = useState('');
  const [physicalExam, setPhysicalExam] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DecisionSuggestion[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ code: number; data: { list: PatientOption[] } }>('/patients', { page: 1, size: 50 })
      .then((res) => {
        if (res.code === 200 && res.data?.list) {
          setPatients(res.data.list);
        }
      })
      .catch(() => {});
  }, []);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
    if (!chiefComplaint && selectedSymptoms.length === 0) return;
    setLoading(true);
    setResults([]);
    setExpandedId(null);

    try {
      const res = await api.post<{ code: number; data: { suggestions: DiagnosisSuggestionRaw[] } }>(
        '/diagnosis/suggest',
        {
          patientId: patient || 'p001',
          symptoms: selectedSymptoms,
          chiefComplaint,
          medicalHistory,
          physicalExam,
        }
      );
      if (res.code === 200 && res.data?.suggestions) {
        setResults(
          res.data.suggestions.map((s) => ({
            id: s.id,
            diseaseName: s.icd10_name,
            icdCode: s.icd10_code,
            confidence: s.confidence,
            evidenceSource: (s.source as 'LLM' | 'KG' | 'RULE' | 'HYBRID') || 'HYBRID',
            evidence: s.evidence || [],
            description: s.description,
            relatedSymptoms: s.related_symptoms || [],
          }))
        );
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await api.post(`/diagnosis/${id}/accept`);
    } catch { /* ignore */ }
    setResults((prev) => prev.filter((s) => s.id !== id));
  };

  const handleReject = (id: string) => {
    setResults((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-slate-800">智能诊断辅助</h2>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg border border-slate-100 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-700">患者信息与症状输入</h3>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">选择患者</label>
              <select
                value={patient}
                onChange={(e) => setPatient(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">请选择患者</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.medical_record_no}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">主诉</label>
              <input
                type="text"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="如：胸痛3小时"
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">症状选择</label>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => toggleSymptom(symptom)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                      selectedSymptoms.includes(symptom)
                        ? 'bg-sky-50 border-sky-300 text-sky-600'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-sky-200'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">既往病史</label>
              <textarea
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                placeholder="如：高血压10年，糖尿病5年..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-500 mb-1.5">体格检查</label>
              <textarea
                value={physicalExam}
                onChange={(e) => setPhysicalExam(e.target.value)}
                placeholder="如：BP 150/90mmHg，HR 92次/分..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || (!chiefComplaint && selectedSymptoms.length === 0)}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-medium rounded-md text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI分析中...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  AI辅助诊断
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          {loading && (
            <div className="bg-white rounded-lg border border-slate-100 p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
              <p className="text-sm text-slate-500">AI正在分析症状与病史...</p>
              <p className="text-xs text-slate-400 mt-1">结合知识图谱、规则引擎与大语言模型</p>
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="bg-white rounded-lg border border-slate-100 p-12 flex flex-col items-center justify-center">
              <Brain className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-sm text-slate-400">请输入患者症状信息，点击"AI辅助诊断"获取诊断建议</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-1">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-xs text-orange-600 font-medium">仅供医生参考，不替代专业诊断</span>
              </div>

              <div className="space-y-3">
                {results.map((suggestion, index) => (
                  <div key={suggestion.id} className="bg-white rounded-lg border border-slate-100 overflow-hidden">
                    <div
                      className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => setExpandedId(expandedId === suggestion.id ? null : suggestion.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            index === 0 ? 'bg-red-50 text-red-600' : index === 1 ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-800">{suggestion.diseaseName}</span>
                              <span className="text-xs text-slate-400 font-mono">{suggestion.icdCode}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${sourceColor[suggestion.evidenceSource]}`}>
                                {sourceLabel[suggestion.evidenceSource] || suggestion.evidenceSource}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{suggestion.description}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-sky-600">{(suggestion.confidence * 100).toFixed(0)}%</div>
                            <div className="text-xs text-slate-400">置信度</div>
                          </div>
                          {expandedId === suggestion.id ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              suggestion.confidence > 0.8 ? 'bg-green-500' : suggestion.confidence > 0.5 ? 'bg-orange-500' : 'bg-slate-300'
                            }`}
                            style={{ width: `${suggestion.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {expandedId === suggestion.id && (
                      <div className="px-4 pb-4 border-t border-slate-50 pt-3">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-xs font-medium text-slate-500 mb-2">诊断依据</h4>
                            <ul className="space-y-1">
                              {suggestion.evidence.map((e, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                                  {e}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="text-xs font-medium text-slate-500 mb-2">相关症状</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {suggestion.relatedSymptoms.map((s) => (
                                <span key={s} className="px-2 py-0.5 bg-slate-50 text-slate-600 text-xs rounded">{s}</span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAccept(suggestion.id); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-sky-50 text-sky-600 text-xs rounded-md hover:bg-sky-100 transition-colors"
                            >
                              <Check className="w-3 h-3" /> 采纳
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleReject(suggestion.id); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-500 text-xs rounded-md hover:bg-slate-100 transition-colors"
                            >
                              <X className="w-3 h-3" /> 排除
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
