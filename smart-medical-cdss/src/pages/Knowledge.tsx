import { useState } from 'react';
import { Search, BookOpen, Pill, TestTube2, Stethoscope, ChevronRight, X } from 'lucide-react';
import type { KnowledgeItem } from '@/types';

const mockKnowledge: KnowledgeItem[] = [
  {
    id: '1', type: '疾病', title: '急性心肌梗死', keywords: ['心肌梗死', 'STEMI', '胸痛', '冠脉介入'],
    summary: '急性心肌梗死是由于冠状动脉急性闭塞导致心肌缺血坏死的临床综合征，表现为持续性胸痛、心电图ST段抬高和心肌标志物升高。',
    source: '《内科学(第9版)》', content: '急性心肌梗死(AMI)是冠状动脉急性、持续性缺血缺氧所引起的心肌坏死。临床上多有剧烈而持久的胸骨后疼痛，休息及硝酸酯类药物不能完全缓解，伴有血清心肌酶活性增高及进行性心电图变化，可并发心律失常、休克或心力衰竭，常可危及生命。',
    relatedItems: ['2', '5'], updatedAt: '2024-01-10',
  },
  {
    id: '2', type: '药品', title: '阿司匹林肠溶片', keywords: ['抗血小板', '解热镇痛', '心血管'],
    summary: '阿司匹林是非甾体抗炎药，低剂量具有抗血小板聚集作用，广泛用于心血管疾病的一级和二级预防。',
    source: '《中国药典(2020版)》', content: '适应症: 1.抑制血小板聚集:用于预防短暂脑缺血发作、心肌梗死、心房颤动等；2.解热镇痛；3.抗炎抗风湿。用法用量: 抑制血小板聚集: 75-100mg/d。注意事项: 活动性消化道溃疡禁用，血友病或血小板减少禁用。',
    relatedItems: ['1', '3'], updatedAt: '2024-01-08',
  },
  {
    id: '3', type: '药品', title: '氯吡格雷片', keywords: ['抗血小板', 'P2Y12抑制剂', '双抗'],
    summary: '氯吡格雷是P2Y12受体拮抗剂，通过抑制ADP介导的血小板聚集发挥抗血栓作用。',
    source: '《中国药典(2020版)》', content: '适应症: 预防动脉粥样硬化血栓形成事件。用法用量: 75mg每日一次。注意事项: 活动性出血禁用，肝功能损害慎用。与奥美拉唑联用可降低氯吡格雷抗血小板活性。',
    relatedItems: ['2'], updatedAt: '2024-01-05',
  },
  {
    id: '4', type: '指南', title: '急性ST段抬高型心肌梗死诊断和治疗指南', keywords: ['STEMI', '再灌注', 'PCI', '溶栓'],
    summary: '中华心血管病学会发布的STEMI诊断和治疗指南，涵盖早期诊断、再灌注治疗和二级预防。',
    source: '中华心血管病杂志 2019', content: '关键推荐: 1.STEMI诊断标准: 心肌标志物升高+至少1项缺血证据；2.再灌注治疗: 发病12h内行直接PCI(FMC至球囊扩张<90min)；3.双抗治疗: 阿司匹林+P2Y12抑制剂至少12个月；4.他汀: 尽早启动高强度他汀治疗。',
    relatedItems: ['1', '2', '3'], updatedAt: '2023-12-20',
  },
  {
    id: '5', type: '检查', title: '肌钙蛋白检测', keywords: ['cTnI', 'cTnT', '心肌损伤', '心肌标志物'],
    summary: '肌钙蛋白是诊断急性心肌梗死的首选标志物，具有高敏感性和高特异性。',
    source: '《实验诊断学(第9版)》', content: '肌钙蛋白包括cTnI和cTnT，是心肌损伤的特异性标志物。正常参考值: cTnI <0.04ng/mL。AMI诊断标准: cTn升高超过99百分位参考上限，且有动态变化。cTn在发病后3-6小时开始升高，10-24小时达峰，cTnI可持续7-10天。',
    relatedItems: ['1'], updatedAt: '2024-01-12',
  },
  {
    id: '6', type: '疾病', title: '慢性肾功能不全', keywords: ['CKD', '肾功能', '透析', 'eGFR'],
    summary: '慢性肾脏病是各种原因引起的慢性肾脏结构和功能障碍，根据eGFR进行分期。',
    source: '《内科学(第9版)》', content: 'CKD分期: 1期 eGFR≥90; 2期 60-89; 3期 30-59; 4期 15-29; 5期 <15。治疗原则: 延缓肾功能恶化，控制血压和蛋白尿，纠正贫血和钙磷代谢紊乱，必要时肾脏替代治疗。',
    relatedItems: [], updatedAt: '2024-01-03',
  },
];

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  '疾病': { icon: Stethoscope, color: 'text-red-500', bg: 'bg-red-50' },
  '药品': { icon: Pill, color: 'text-sky-500', bg: 'bg-sky-50' },
  '指南': { icon: BookOpen, color: 'text-violet-500', bg: 'bg-violet-50' },
  '检查': { icon: TestTube2, color: 'text-green-500', bg: 'bg-green-50' },
};

const typeTabs = ['全部', '疾病', '药品', '指南', '检查'];

export default function Knowledge() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState('全部');
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [results, setResults] = useState(mockKnowledge);
  const [searched, setSearched] = useState(true);

  const handleSearch = () => {
    const q = searchQuery.toLowerCase();
    const filtered = mockKnowledge.filter((item) => {
      const matchType = activeType === '全部' || item.type === activeType;
      const matchQuery = !q || item.title.toLowerCase().includes(q) || item.keywords.some((k) => k.toLowerCase().includes(q));
      return matchType && matchQuery;
    });
    setResults(filtered);
    setSearched(true);
  };

  const handleTypeChange = (type: string) => {
    setActiveType(type);
    const q = searchQuery.toLowerCase();
    const filtered = mockKnowledge.filter((item) => {
      const matchType = type === '全部' || item.type === type;
      const matchQuery = !q || item.title.toLowerCase().includes(q) || item.keywords.some((k) => k.toLowerCase().includes(q));
      return matchType && matchQuery;
    });
    setResults(filtered);
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-slate-800">知识库</h2>

      <div className="bg-white rounded-lg border border-slate-100 p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索疾病、药品、指南、检查..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-medium rounded-md text-sm transition-colors"
          >
            搜索
          </button>
        </div>

        <div className="flex items-center gap-2">
          {typeTabs.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                activeType === type
                  ? 'bg-sky-50 text-sky-600 border border-sky-200'
                  : 'text-slate-400 hover:text-slate-600 border border-transparent'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {results.length === 0 ? (
            <div className="bg-white rounded-lg border border-slate-100 p-12 flex flex-col items-center justify-center">
              <BookOpen className="w-12 h-12 text-slate-200 mb-4" />
              <p className="text-sm text-slate-400">未找到相关知识</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((item) => {
                const config = typeConfig[item.type];
                const Icon = config.icon;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedItem?.id === item.id ? 'border-sky-300 shadow-sm' : 'border-slate-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded ${config.bg} ${config.color}`}>
                            <Icon className="w-3 h-3" />
                            {item.type}
                          </span>
                          <h3 className="text-sm font-semibold text-slate-800">{item.title}</h3>
                        </div>
                        <p className="text-xs text-slate-500 line-clamp-2">{item.summary}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {item.keywords.slice(0, 4).map((kw) => (
                            <span key={kw} className="px-1.5 py-0.5 bg-slate-50 text-slate-400 text-xs rounded">{kw}</span>
                          ))}
                          <span className="text-xs text-slate-300">{item.source}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 mt-1 flex-shrink-0" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          {selectedItem ? (
            <div className="bg-white rounded-lg border border-slate-100 p-5 sticky top-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {(() => {
                    const config = typeConfig[selectedItem.type];
                    const Icon = config.icon;
                    return (
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded ${config.bg} ${config.color}`}>
                        <Icon className="w-3 h-3" />
                        {selectedItem.type}
                      </span>
                    );
                  })()}
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-slate-100 rounded transition-colors">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-800 mb-3">{selectedItem.title}</h3>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {selectedItem.keywords.map((kw) => (
                  <span key={kw} className="px-2 py-0.5 bg-sky-50 text-sky-600 text-xs rounded">{kw}</span>
                ))}
              </div>

              <div className="text-sm text-slate-600 leading-relaxed mb-4">
                {selectedItem.content}
              </div>

              <div className="pt-3 border-t border-slate-50">
                <p className="text-xs text-slate-400">来源: {selectedItem.source}</p>
                <p className="text-xs text-slate-400">更新: {selectedItem.updatedAt}</p>
              </div>

              {selectedItem.relatedItems && selectedItem.relatedItems.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-50">
                  <h4 className="text-xs font-medium text-slate-500 mb-2">相关知识</h4>
                  <div className="space-y-1.5">
                    {selectedItem.relatedItems.map((rid) => {
                      const related = mockKnowledge.find((k) => k.id === rid);
                      if (!related) return null;
                      return (
                        <button
                          key={rid}
                          onClick={() => setSelectedItem(related)}
                          className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded hover:bg-slate-50 transition-colors"
                        >
                          <ChevronRight className="w-3 h-3 text-slate-300" />
                          <span className="text-xs text-sky-600">{related.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-slate-100 p-8 flex flex-col items-center justify-center">
              <BookOpen className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-sm text-slate-400">点击左侧知识卡片查看详情</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
