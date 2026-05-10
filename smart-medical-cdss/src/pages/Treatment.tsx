import { useState } from 'react';
import { ClipboardList, Search, ChevronDown, ChevronUp, BookOpen, User } from 'lucide-react';
import type { TreatmentPlan } from '@/types';

const mockPlans: TreatmentPlan[] = [
  {
    id: '1', diseaseName: '急性心肌梗死', guidelineSource: '《急性ST段抬高型心肌梗死诊断和治疗指南(2019)》',
    medicationPlan: '1. 抗血小板治疗: 阿司匹林100mg/d + 氯吡格雷75mg/d (双抗12个月)\n2. 抗凝治疗: 依诺肝素1mg/kg q12h\n3. 调脂治疗: 阿托伐他汀40mg/d\n4. β受体阻滞剂: 美托洛尔缓释片47.5mg/d\n5. ACEI/ARB: 卡托普利6.25mg起始',
    precautions: '1. 24小时心电监护\n2. 监测心肌标志物动态变化\n3. 关注出血风险\n4. 注意低血压和心动过缓\n5. 避免剧烈活动',
    followUpSchedule: '出院后1个月、3个月、6个月、12个月门诊随访，之后每年随访',
    adjustmentSuggestions: '患者65岁男性，肾功能轻度受损(Cr 135μmol/L)，建议:\n1. 依诺肝素剂量减半\n2. ACEI从小剂量起始，监测肾功能和血钾\n3. 避免使用造影剂或使用前充分水化',
    confidence: 0.95,
  },
  {
    id: '2', diseaseName: '急性心肌梗死', guidelineSource: '《ESC急性心血管病治疗指南(2020)》',
    medicationPlan: '1. 双联抗血小板: 阿司匹林+替格瑞洛(优选)\n2. 抗凝: 磺达肝癸钠或依诺肝素\n3. 他汀: 瑞舒伐他汀20mg/d\n4. β受体阻滞剂\n5. ACEI/ARB',
    precautions: '1. 替格瑞洛注意出血和呼吸困难\n2. 磺达肝癸钠禁用于肌酐清除率<20ml/min\n3. 早期活动评估',
    followUpSchedule: '出院后1个月复查，3个月评估心功能',
    adjustmentSuggestions: '根据患者肾功能，磺达肝癸钠需慎用',
    confidence: 0.88,
  },
  {
    id: '3', diseaseName: '高血压合并冠心病', guidelineSource: '《中国高血压防治指南(2018年修订版)》',
    medicationPlan: '1. ACEI/ARB: 首选，心肾保护\n2. β受体阻滞剂: 控制心率和血压\n3. 钙通道阻滞剂: 如血压控制不佳可联合\n4. 利尿剂: 小剂量联合',
    precautions: '1. 目标血压<130/80mmHg\n2. 避免血压下降过快\n3. 监测电解质',
    followUpSchedule: '每月随访至血压达标，之后每3个月',
    confidence: 0.72,
  },
];

export default function Treatment() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setPlans(mockPlans);
    setSearched(true);
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-slate-800">治疗方案</h2>

      <div className="bg-white rounded-lg border border-slate-100 p-5">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索疾病或指南名称..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-medium rounded-md text-sm transition-colors"
          >
            {loading ? '搜索中...' : '搜索方案'}
          </button>
        </div>
      </div>

      {!searched && (
        <div className="bg-white rounded-lg border border-slate-100 p-12 flex flex-col items-center justify-center">
          <ClipboardList className="w-12 h-12 text-slate-200 mb-4" />
          <p className="text-sm text-slate-400">输入疾病名称搜索治疗方案</p>
          <p className="text-xs text-slate-300 mt-1">系统将基于临床指南推荐标准化治疗方案</p>
        </div>
      )}

      {searched && plans.length === 0 && (
        <div className="bg-white rounded-lg border border-slate-100 p-12 flex flex-col items-center justify-center">
          <p className="text-sm text-slate-400">未找到相关治疗方案</p>
        </div>
      )}

      {plans.length > 0 && (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg border border-slate-100 overflow-hidden">
              <div
                className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpandedId(expandedId === plan.id ? null : plan.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-slate-800">{plan.diseaseName}</h3>
                      <span className="text-xs px-2 py-0.5 bg-sky-50 text-sky-600 rounded">
                        置信度 {(plan.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-xs text-slate-500">{plan.guidelineSource}</span>
                    </div>
                  </div>
                  {expandedId === plan.id ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </div>

              {expandedId === plan.id && (
                <div className="px-5 pb-5 border-t border-slate-50 pt-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-sky-500" />
                      用药方案
                    </h4>
                    <div className="bg-slate-50 rounded-md p-3">
                      {plan.medicationPlan.split('\n').map((line, i) => (
                        <p key={i} className="text-sm text-slate-700 leading-relaxed">{line}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-orange-500" />
                      注意事项
                    </h4>
                    <div className="bg-orange-50 rounded-md p-3">
                      {plan.precautions.split('\n').map((line, i) => (
                        <p key={i} className="text-sm text-orange-700 leading-relaxed">{line}</p>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-green-500" />
                      随访计划
                    </h4>
                    <p className="text-sm text-slate-600">{plan.followUpSchedule}</p>
                  </div>

                  {plan.adjustmentSuggestions && (
                    <div>
                      <h4 className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                        <User className="w-3 h-3 text-violet-500" />
                        个体化调整建议
                      </h4>
                      <div className="bg-violet-50 border border-violet-100 rounded-md p-3">
                        {plan.adjustmentSuggestions.split('\n').map((line, i) => (
                          <p key={i} className="text-sm text-violet-700 leading-relaxed">{line}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
