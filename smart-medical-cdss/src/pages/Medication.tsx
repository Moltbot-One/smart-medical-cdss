import { useState } from 'react';
import { Pill, Plus, X, AlertTriangle, Calculator, Search } from 'lucide-react';
import type { MedicationWarning } from '@/types';

const drugDatabase = [
  '阿司匹林', '华法林', '氯吡格雷', '阿托伐他汀', '美托洛尔',
  '氨氯地平', '二甲双胍', '格列美脲', '奥美拉唑', '头孢曲松',
  '青霉素', '万古霉素', '地高辛', '呋塞米', '螺内酯',
  '依诺肝素', '辛伐他汀', '卡托普利', '硝苯地平', '胺碘酮',
];

const mockWarnings: MedicationWarning[] = [
  {
    id: '1', drugA: '阿司匹林', drugB: '华法林', severity: '禁忌',
    interactionType: '药效学相互作用',
    description: '阿司匹林与华法林联用显著增加出血风险，包括胃肠道出血和颅内出血',
    recommendation: '避免联用。如必须抗凝治疗，建议使用单一抗凝药物并密切监测INR',
    evidence: '多项临床研究证实联用出血风险增加3-4倍',
  },
  {
    id: '2', drugA: '阿司匹林', drugB: '氯吡格雷', severity: '严重',
    interactionType: '药效学相互作用',
    description: '双联抗血小板治疗增加出血风险，但某些情况下为标准治疗方案',
    recommendation: '如为ACS或PCI术后标准治疗，可短期联用但需监测出血征象',
    evidence: 'CURE研究等证实双抗获益与风险',
  },
  {
    id: '3', drugA: '美托洛尔', drugB: '胺碘酮', severity: '警告',
    interactionType: '药效学相互作用',
    description: '两药均可减慢心率，联用可能致严重心动过缓',
    recommendation: '联用时需密切监测心率，如心率<55次/分需调整剂量',
    evidence: '药品说明书及临床药理学指南',
  },
  {
    id: '4', drugA: '阿托伐他汀', drugB: '氨氯地平', severity: '注意',
    interactionType: '药代动力学相互作用',
    description: '氨氯地平可轻度升高阿托伐他汀血药浓度',
    recommendation: '阿托伐他汀剂量不超过20mg/日，或更换他汀种类',
    evidence: '药代动力学研究数据',
  },
];

const severityConfig: Record<string, { bg: string; border: string; text: string; icon: string; dot: string }> = {
  '禁忌': { bg: 'bg-red-50', border: 'border-l-red-500', text: 'text-red-700', icon: 'text-red-500', dot: 'bg-red-500' },
  '严重': { bg: 'bg-orange-50', border: 'border-l-orange-500', text: 'text-orange-700', icon: 'text-orange-500', dot: 'bg-orange-500' },
  '警告': { bg: 'bg-yellow-50', border: 'border-l-yellow-500', text: 'text-yellow-700', icon: 'text-yellow-500', dot: 'bg-yellow-500' },
  '注意': { bg: 'bg-sky-50', border: 'border-l-sky-500', text: 'text-sky-700', icon: 'text-sky-500', dot: 'bg-sky-500' },
};

export default function Medication() {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [warnings, setWarnings] = useState<MedicationWarning[]>([]);
  const [checked, setChecked] = useState(false);

  const [doseDrug, setDoseDrug] = useState('');
  const [weight, setWeight] = useState('');
  const [doseResult, setDoseResult] = useState('');

  const filteredDrugs = drugDatabase.filter(
    (d) => d.includes(searchQuery) && !selectedDrugs.includes(d)
  );

  const addDrug = (drug: string) => {
    setSelectedDrugs((prev) => [...prev, drug]);
    setSearchQuery('');
    setShowSearch(false);
    setChecked(false);
    setWarnings([]);
  };

  const removeDrug = (drug: string) => {
    setSelectedDrugs((prev) => prev.filter((d) => d !== drug));
    setChecked(false);
    setWarnings([]);
  };

  const handleCheck = async () => {
    if (selectedDrugs.length < 2) return;
    setChecked(false);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setWarnings(mockWarnings.filter((w) =>
      selectedDrugs.includes(w.drugA) && selectedDrugs.includes(w.drugB)
    ));
    setChecked(true);
  };

  const calculateDose = () => {
    if (!doseDrug || !weight) return;
    const w = parseFloat(weight);
    if (isNaN(w)) return;
    setDoseResult(`推荐剂量: ${(w * 5).toFixed(0)}mg/次，每日2次（按${w}kg体重计算）`);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-slate-800">用药决策</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">药品列表</h3>

            <div className="flex flex-wrap gap-2 mb-3">
              {selectedDrugs.map((drug) => (
                <span key={drug} className="flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-600 text-xs rounded-md border border-sky-200">
                  <Pill className="w-3 h-3" />
                  {drug}
                  <button onClick={() => removeDrug(drug)} className="hover:text-red-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowSearch(true); }}
                  onFocus={() => setShowSearch(true)}
                  placeholder="搜索药品..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {showSearch && searchQuery && filteredDrugs.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {filteredDrugs.map((drug) => (
                    <button
                      key={drug}
                      onClick={() => addDrug(drug)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-colors"
                    >
                      {drug}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleCheck}
              disabled={selectedDrugs.length < 2}
              className="w-full mt-4 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-medium rounded-md text-sm transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              相互作用检查
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-slate-400" />
              剂量计算器
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">药品名称</label>
                <select
                  value={doseDrug}
                  onChange={(e) => setDoseDrug(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">选择药品</option>
                  {drugDatabase.slice(0, 8).map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">体重 (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="输入体重"
                  className="w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <button
                onClick={calculateDose}
                disabled={!doseDrug || !weight}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white text-sm rounded-md transition-colors"
              >
                计算剂量
              </button>
              {doseResult && (
                <div className="p-3 bg-sky-50 border border-sky-100 rounded-md text-sm text-sky-700">
                  {doseResult}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!checked && warnings.length === 0 && (
            <div className="bg-white rounded-lg border border-slate-100 p-12 flex flex-col items-center justify-center">
              <Pill className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-sm text-slate-400">添加两种及以上药品后，点击"相互作用检查"</p>
              <p className="text-xs text-slate-300 mt-1">系统将自动检测药品间的相互作用</p>
            </div>
          )}

          {checked && warnings.length === 0 && (
            <div className="bg-white rounded-lg border border-slate-100 p-12 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <p className="text-sm text-green-600 font-medium">未发现严重药物相互作用</p>
              <p className="text-xs text-slate-400 mt-1">当前药品组合相对安全</p>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-slate-700">发现 {warnings.length} 条药物相互作用</span>
              </div>

              {warnings.map((warning) => {
                const config = severityConfig[warning.severity];
                return (
                  <div key={warning.id} className={`rounded-lg border border-slate-100 border-l-4 ${config.border} overflow-hidden`}>
                    <div className={`${config.bg} px-5 py-3`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${config.dot}`} />
                          <span className={`text-xs font-bold ${config.text}`}>{warning.severity}</span>
                          <span className="text-sm text-slate-700 font-medium">
                            {warning.drugA} + {warning.drugB}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{warning.interactionType}</span>
                      </div>
                    </div>
                    <div className="px-5 py-4 space-y-3">
                      <p className="text-sm text-slate-600">{warning.description}</p>
                      <div className="bg-slate-50 rounded-md p-3">
                        <p className="text-xs text-slate-500 mb-1">建议</p>
                        <p className="text-sm text-slate-700">{warning.recommendation}</p>
                      </div>
                      <p className="text-xs text-slate-400">证据来源: {warning.evidence}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
