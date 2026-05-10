export interface DiagnosisSuggestion {
  icd10_code: string
  icd10_name: string
  confidence: number
  evidence: string[]
  source: 'LLM' | 'KG' | 'RULE' | 'HYBRID'
  description: string
  related_symptoms: string[]
  suggested_exams: string[]
}

export interface MedicationWarning {
  level: '禁忌' | '严重' | '警告' | '注意'
  type: string
  message: string
  drugs?: string[]
  detail?: string
}

export interface LabInterpretation {
  test_name: string
  result_value: string
  unit: string
  reference_range: string
  is_abnormal: boolean
  is_critical: boolean
  clinical_significance: string
  possible_causes: string[]
  recommended_actions: string[]
  trend_analysis: string
}

const symptomDiagnosisMap: Record<string, Array<{ code: string; name: string; weight: number; evidence: string; exams: string[] }>> = {
  '头痛': [
    { code: 'G43.9', name: '偏头痛', weight: 0.7, evidence: '搏动性头痛伴恶心，有先兆', exams: ['头颅CT', '脑电图'] },
    { code: 'I10', name: '原发性高血压', weight: 0.6, evidence: '血压升高引起的头痛，多位于枕部', exams: ['血压监测', '头颅CT'] },
    { code: 'G44.2', name: '紧张型头痛', weight: 0.5, evidence: '压迫感或紧箍感，与精神紧张相关', exams: ['头颅CT', '心理评估'] },
  ],
  '头晕': [
    { code: 'I10', name: '原发性高血压', weight: 0.7, evidence: '血压升高导致头晕', exams: ['血压监测', '头颅CT'] },
    { code: 'M47.8', name: '颈椎病', weight: 0.5, evidence: '颈部不适伴头晕，转颈时加重', exams: ['颈椎X线', '颈动脉超声'] },
    { code: 'D50.9', name: '贫血', weight: 0.4, evidence: '血红蛋白降低导致脑供氧不足', exams: ['血常规', '铁代谢'] },
    { code: 'H81.0', name: '梅尼埃病', weight: 0.4, evidence: '眩晕伴耳鸣、听力下降', exams: ['听力检查', '前庭功能检查'] },
  ],
  '发热': [
    { code: 'J06.9', name: '上呼吸道感染', weight: 0.7, evidence: '发热伴咳嗽、咽痛等上呼吸道症状', exams: ['血常规', 'CRP'] },
    { code: 'J18.9', name: '肺炎', weight: 0.6, evidence: '发热伴咳嗽咳痰，肺部体征', exams: ['胸片/CT', '血常规', 'CRP', 'PCT'] },
    { code: 'N39.0', name: '泌尿系感染', weight: 0.4, evidence: '发热伴尿频尿急尿痛', exams: ['尿常规', '尿培养'] },
    { code: 'A41.9', name: '败血症', weight: 0.3, evidence: '高热伴寒战，感染指标显著升高', exams: ['血培养', 'PCT', 'CRP'] },
  ],
  '咳嗽': [
    { code: 'J06.9', name: '上呼吸道感染', weight: 0.6, evidence: '咳嗽伴咽痛、流涕', exams: ['血常规'] },
    { code: 'J18.9', name: '肺炎', weight: 0.6, evidence: '咳嗽伴发热、咳痰', exams: ['胸片/CT', '血常规'] },
    { code: 'J40', name: '支气管炎', weight: 0.5, evidence: '咳嗽伴咳痰，肺部啰音', exams: ['胸片', '血常规'] },
    { code: 'J45.9', name: '支气管哮喘', weight: 0.4, evidence: '咳嗽伴喘息，夜间加重', exams: ['肺功能', '过敏原检测'] },
  ],
  '咳痰': [
    { code: 'J18.9', name: '肺炎', weight: 0.7, evidence: '咳痰伴发热，痰液性质提示感染', exams: ['胸片/CT', '痰培养'] },
    { code: 'J40', name: '支气管炎', weight: 0.6, evidence: '咳痰，痰量增多', exams: ['胸片', '痰培养'] },
    { code: 'J44.1', name: '慢性阻塞性肺疾病急性加重期', weight: 0.5, evidence: '长期吸烟史，咳痰量增多或性质改变', exams: ['肺功能', '胸片', '血气分析'] },
  ],
  '胸痛': [
    { code: 'I21.9', name: '急性心肌梗死', weight: 0.8, evidence: '剧烈胸痛，持续不缓解，向左肩臂放射', exams: ['心电图', '肌钙蛋白', 'CK-MB', '冠脉造影'] },
    { code: 'I20.9', name: '心绞痛', weight: 0.7, evidence: '胸痛与活动相关，休息或含服硝酸甘油可缓解', exams: ['心电图', '肌钙蛋白', '冠脉造影'] },
    { code: 'I26.9', name: '肺栓塞', weight: 0.4, evidence: '胸痛伴呼吸困难，D-二聚体升高', exams: ['D-二聚体', 'CTPA', '下肢静脉超声'] },
    { code: 'J93', name: '气胸', weight: 0.3, evidence: '突发胸痛伴呼吸困难，患侧呼吸音减低', exams: ['胸片'] },
  ],
  '胸闷': [
    { code: 'I25.1', name: '冠状动脉粥样硬化性心脏病', weight: 0.7, evidence: '活动后胸闷，冠心病危险因素', exams: ['心电图', '心脏超声', '冠脉造影'] },
    { code: 'I50.9', name: '心功能不全', weight: 0.5, evidence: '胸闷伴气短，活动耐量下降', exams: ['BNP', '心脏超声', '胸片'] },
    { code: 'J45.9', name: '支气管哮喘', weight: 0.4, evidence: '胸闷伴喘息', exams: ['肺功能', '过敏原检测'] },
  ],
  '气短': [
    { code: 'I50.9', name: '心功能不全', weight: 0.6, evidence: '气短伴胸闷，活动后加重', exams: ['BNP', '心脏超声'] },
    { code: 'J18.9', name: '肺炎', weight: 0.5, evidence: '气短伴发热、咳嗽', exams: ['胸片/CT', '血常规'] },
    { code: 'J45.9', name: '支气管哮喘', weight: 0.5, evidence: '气短伴喘息', exams: ['肺功能', '过敏原检测'] },
    { code: 'D50.9', name: '贫血', weight: 0.3, evidence: '气短伴乏力，血红蛋白降低', exams: ['血常规'] },
  ],
  '腹痛': [
    { code: 'A09', name: '急性胃肠炎', weight: 0.6, evidence: '腹痛伴腹泻、恶心', exams: ['血常规', '大便常规'] },
    { code: 'K25.9', name: '消化性溃疡', weight: 0.5, evidence: '上腹痛，与进食相关', exams: ['胃镜', '幽门螺杆菌检测'] },
    { code: 'K35.9', name: '急性阑尾炎', weight: 0.5, evidence: '转移性右下腹痛', exams: ['血常规', '腹部超声/CT'] },
    { code: 'K81.0', name: '胆囊炎', weight: 0.4, evidence: '右上腹痛，Murphy征阳性', exams: ['腹部超声', '肝功能'] },
  ],
  '腹泻': [
    { code: 'A09', name: '急性胃肠炎', weight: 0.7, evidence: '腹泻伴腹痛、恶心', exams: ['大便常规', '血常规'] },
    { code: 'K58', name: '肠易激综合征', weight: 0.3, evidence: '反复腹泻与便秘交替，与情绪相关', exams: ['肠镜', '大便常规'] },
  ],
  '恶心': [
    { code: 'A09', name: '急性胃肠炎', weight: 0.6, evidence: '恶心伴腹痛、腹泻', exams: ['血常规', '大便常规'] },
    { code: 'K25.9', name: '消化性溃疡', weight: 0.4, evidence: '恶心伴上腹痛', exams: ['胃镜'] },
  ],
  '呕吐': [
    { code: 'A09', name: '急性胃肠炎', weight: 0.6, evidence: '呕吐伴腹痛、腹泻', exams: ['血常规', '电解质'] },
    { code: 'K56', name: '肠梗阻', weight: 0.4, evidence: '呕吐伴腹痛、停止排气排便', exams: ['腹平片', '腹部CT'] },
    { code: 'E11.1', name: '糖尿病酮症酸中毒', weight: 0.3, evidence: '呕吐伴血糖升高、酮体阳性', exams: ['血糖', '血酮体', '血气分析'] },
  ],
  '心悸': [
    { code: 'I49.9', name: '心律失常', weight: 0.6, evidence: '心悸，心电图异常', exams: ['心电图', '动态心电图'] },
    { code: 'E05.9', name: '甲状腺功能亢进症', weight: 0.5, evidence: '心悸伴手抖、消瘦', exams: ['甲状腺功能', '心电图'] },
    { code: 'D50.9', name: '贫血', weight: 0.4, evidence: '心悸伴乏力、面色苍白', exams: ['血常规'] },
  ],
  '多饮': [
    { code: 'E11.9', name: '2型糖尿病', weight: 0.7, evidence: '多饮伴多尿、体重下降', exams: ['空腹血糖', '糖化血红蛋白', 'OGTT'] },
    { code: 'E05.9', name: '甲状腺功能亢进症', weight: 0.3, evidence: '多饮伴心悸、消瘦', exams: ['甲状腺功能'] },
  ],
  '多尿': [
    { code: 'E11.9', name: '2型糖尿病', weight: 0.7, evidence: '多尿伴多饮、血糖升高', exams: ['空腹血糖', '糖化血红蛋白'] },
    { code: 'N18', name: '慢性肾病', weight: 0.3, evidence: '多尿伴肾功能异常', exams: ['肾功能', '尿常规'] },
  ],
  '体重下降': [
    { code: 'E11.9', name: '2型糖尿病', weight: 0.5, evidence: '体重下降伴多饮多尿', exams: ['空腹血糖', '糖化血红蛋白'] },
    { code: 'E05.9', name: '甲状腺功能亢进症', weight: 0.5, evidence: '体重下降伴心悸、多汗', exams: ['甲状腺功能'] },
    { code: 'C80', name: '恶性肿瘤', weight: 0.3, evidence: '不明原因体重下降>5%/月', exams: ['肿瘤标志物', '影像学检查'] },
  ],
  '关节疼痛': [
    { code: 'M05', name: '类风湿关节炎', weight: 0.5, evidence: '关节疼痛伴晨僵、对称性', exams: ['类风湿因子', '抗CCP抗体', '关节X线'] },
    { code: 'M10', name: '痛风', weight: 0.5, evidence: '关节疼痛急性发作，第一跖趾关节常见', exams: ['血尿酸', '关节超声'] },
    { code: 'M19', name: '骨关节炎', weight: 0.4, evidence: '关节疼痛活动后加重，休息缓解', exams: ['关节X线'] },
  ],
  '喘息': [
    { code: 'J45.9', name: '支气管哮喘', weight: 0.7, evidence: '喘息伴气短，可闻及哮鸣音', exams: ['肺功能', '过敏原检测', 'IgE'] },
    { code: 'J44.1', name: '慢性阻塞性肺疾病急性加重期', weight: 0.5, evidence: '喘息伴长期吸烟史', exams: ['肺功能', '胸片', '血气分析'] },
    { code: 'I50.9', name: '心功能不全', weight: 0.3, evidence: '喘息伴心功能不全表现', exams: ['BNP', '心脏超声'] },
  ],
  '皮疹': [
    { code: 'L50.9', name: '荨麻疹', weight: 0.6, evidence: '皮疹为风团样，可自行消退', exams: ['过敏原检测', 'IgE'] },
    { code: 'L27', name: '药疹', weight: 0.4, evidence: '皮疹与用药时间相关', exams: ['药物过敏史'] },
    { code: 'L30.9', name: '湿疹', weight: 0.4, evidence: '皮疹伴渗出、瘙痒，反复发作', exams: ['过敏原检测'] },
  ],
  '水肿': [
    { code: 'I50.9', name: '心功能不全', weight: 0.5, evidence: '下肢水肿伴胸闷气短', exams: ['BNP', '心脏超声'] },
    { code: 'N04', name: '肾病综合征', weight: 0.5, evidence: '水肿伴大量蛋白尿', exams: ['尿常规', '24小时尿蛋白', '肾功能'] },
    { code: 'E03', name: '甲状腺功能减退', weight: 0.3, evidence: '水肿伴乏力、怕冷', exams: ['甲状腺功能'] },
  ],
  '呕血': [
    { code: 'K25.0', name: '胃溃疡伴出血', weight: 0.6, evidence: '呕血伴上腹痛病史', exams: ['胃镜', '血常规'] },
    { code: 'I85', name: '食管静脉曲张出血', weight: 0.4, evidence: '呕血伴肝硬化病史', exams: ['胃镜', '肝功能'] },
  ],
  '黑便': [
    { code: 'K25.0', name: '胃溃疡伴出血', weight: 0.6, evidence: '黑便伴上腹痛', exams: ['大便隐血', '胃镜', '血常规'] },
    { code: 'K92.2', name: '消化道出血', weight: 0.5, evidence: '黑便提示上消化道出血', exams: ['大便隐血', '胃镜'] },
  ],
  '手抖': [
    { code: 'E05.9', name: '甲状腺功能亢进症', weight: 0.6, evidence: '手抖伴心悸、消瘦', exams: ['甲状腺功能'] },
    { code: 'G25', name: '特发性震颤', weight: 0.3, evidence: '手抖，家族史阳性', exams: ['神经系统检查'] },
  ],
  '消瘦': [
    { code: 'E11.9', name: '2型糖尿病', weight: 0.5, evidence: '消瘦伴多饮多尿', exams: ['空腹血糖', '糖化血红蛋白'] },
    { code: 'E05.9', name: '甲状腺功能亢进症', weight: 0.5, evidence: '消瘦伴心悸、多汗', exams: ['甲状腺功能'] },
  ],
}

const drugInteractionDB: Record<string, Record<string, { level: '禁忌' | '严重' | '警告' | '注意'; message: string; detail: string }>> = {
  '华法林': {
    '阿司匹林': { level: '严重', message: '华法林与阿司匹林联用出血风险显著增加', detail: '华法林为抗凝药，阿司匹林为抗血小板药，两者联用显著增加出血风险，尤其是消化道出血和颅内出血。需密切监测INR和出血征象。' },
    '布洛芬': { level: '严重', message: '华法林与布洛芬联用出血风险增加', detail: 'NSAIDs可增强华法林抗凝效果，同时损害胃黏膜，增加消化道出血风险。' },
    '头孢克肟': { level: '警告', message: '头孢类可能增强华法林抗凝效果', detail: '部分头孢菌素可抑制维生素K合成，增强华法林抗凝效果，需监测INR。' },
    '甲硝唑': { level: '严重', message: '甲硝唑显著增强华法林抗凝效果', detail: '甲硝唑抑制华法林代谢，显著升高INR，增加出血风险。联用时需减少华法林剂量并密切监测INR。' },
  },
  '阿司匹林': {
    '氯吡格雷': { level: '警告', message: '阿司匹林与氯吡格雷联用出血风险增加', detail: '双联抗血小板治疗增加出血风险，但在急性冠脉综合征和PCI术后为标准治疗方案，需权衡获益与风险。' },
    '布洛芬': { level: '警告', message: '阿司匹林与布洛芬联用胃肠道出血风险增加', detail: '布洛芬可竞争性阻断阿司匹林与COX-1的不可逆结合，减弱阿司匹林心血管保护作用，同时增加胃肠道出血风险。' },
    '甲氨蝶呤': { level: '严重', message: '阿司匹林与甲氨蝶呤联用增加甲氨蝶呤毒性', detail: '阿司匹林减少甲氨蝶呤肾排泄，增加血药浓度，可能导致严重骨髓抑制和肝毒性。' },
    '地塞米松': { level: '注意', message: '糖皮质激素与阿司匹林联用增加消化道出血风险', detail: '糖皮质激素促进胃酸分泌，与阿司匹林联用增加消化道溃疡和出血风险。' },
  },
  '缬沙坦': {
    '螺内酯': { level: '警告', message: '缬沙坦与螺内酯联用高钾血症风险', detail: 'ACEI/ARB与保钾利尿剂联用增加高钾血症风险，需密切监测血钾。' },
    '氢氯噻嗪': { level: '注意', message: '缬沙坦与氢氯噻嗪可协同降压', detail: 'ARB与噻嗪类利尿剂联用可协同降压，缬沙坦可减轻氢氯噻嗪引起的低钾血症。注意监测血压和电解质。' },
  },
  '美托洛尔': {
    '维拉帕米': { level: '禁忌', message: '美托洛尔与维拉帕米联用禁忌', detail: 'β受体阻滞剂与非二氢吡啶类钙通道阻滞剂联用可致严重心动过缓、房室传导阻滞和低血压，属禁忌。' },
    '地尔硫䓬': { level: '禁忌', message: '美托洛尔与地尔硫䓬联用禁忌', detail: '联用可致严重心动过缓和低血压。' },
    '胰岛素': { level: '注意', message: '美托洛尔可能掩盖低血糖症状', detail: 'β受体阻滞剂可掩盖心悸、震颤等低血糖症状，延迟低血糖的发现。需加强血糖监测。' },
  },
  '二甲双胍': {
    '造影剂': { level: '警告', message: '二甲双胍与碘造影剂联用需注意乳酸酸中毒', detail: '碘造影剂可能导致肾功能急性下降，增加乳酸酸中毒风险。造影前48h停用二甲双胍，造影后48h复查肾功能正常后恢复。' },
  },
  '阿托伐他汀': {
    '克拉霉素': { level: '严重', message: '阿托伐他汀与克拉霉素联用横纹肌溶解风险', detail: '大环内酯类抗生素抑制CYP3A4，升高他汀血药浓度，增加横纹肌溶解风险。联用时他汀需减量或换药。' },
    '红霉素': { level: '严重', message: '阿托伐他汀与红霉素联用横纹肌溶解风险', detail: '同克拉霉素，CYP3A4抑制导致他汀血药浓度升高。' },
    '地塞米松': { level: '注意', message: '糖皮质激素可能升高血糖，影响糖尿病控制', detail: '地塞米松可升高血糖，糖尿病患者使用需加强血糖监测。' },
  },
  '左氧氟沙星': {
    '布洛芬': { level: '警告', message: '左氧氟沙星与NSAIDs联用惊厥风险增加', detail: '氟喹诺酮类与NSAIDs联用可降低癫痫发作阈值，增加惊厥风险。' },
  },
  '甲硝唑': {
    '酒精': { level: '禁忌', message: '甲硝唑与酒精联用可致双硫仑样反应', detail: '甲硝唑抑制乙醛脱氢酶，饮酒后乙醛蓄积，出现面部潮红、头痛、心悸、恶心等症状，严重者可致休克。用药期间及停药后3天内禁酒。' },
  },
  '奥美拉唑': {
    '氯吡格雷': { level: '警告', message: '奥美拉唑可能降低氯吡格雷疗效', detail: '奥美拉唑抑制CYP2C19，减少氯吡格雷活性代谢物生成，可能降低抗血小板效果。建议换用泮托拉唑或H2受体阻滞剂。' },
  },
  '头孢呋辛': {
    '呋塞米': { level: '注意', message: '头孢类与利尿剂联用注意肾毒性', detail: '头孢类与利尿剂联用可能增加肾毒性风险，需监测肾功能。' },
  },
  '氨氯地平': {
    '美托洛尔': { level: '注意', message: '氨氯地平与美托洛尔联用协同降压', detail: '二氢吡啶类CCB与β受体阻滞剂联用可协同降压，需注意监测血压和心率。' },
  },
  '氢氯噻嗪': {
    '螺内酯': { level: '注意', message: '氢氯噻嗪与螺内酯联用需监测电解质', detail: '噻嗪类利尿剂排钾，保钾利尿剂保钾，联用对血钾影响可能相互抵消，但仍需监测电解质。' },
  },
  '阿莫西林': {
    '甲氨蝶呤': { level: '严重', message: '阿莫西林与甲氨蝶呤联用增加甲氨蝶呤毒性', detail: '青霉素类减少甲氨蝶呤肾清除，增加血药浓度和毒性。' },
  },
  '普萘洛尔': {
    '沙丁胺醇': { level: '警告', message: '普萘洛尔可能拮抗沙丁胺醇支气管扩张作用', detail: '非选择性β受体阻滞剂可拮抗β2受体激动剂的支气管扩张作用，哮喘患者禁用非选择性β受体阻滞剂。' },
  },
}

const allergyDrugMap: Record<string, string[]> = {
  '青霉素': ['阿莫西林', '氨苄西林', '青霉素V钾', '哌拉西林', '阿莫西林克拉维酸钾'],
  '磺胺类': ['磺胺甲噁唑', '复方磺胺甲噁唑', '柳氮磺吡啶'],
  '碘': ['碘造影剂', '碘化钾', '胺碘酮'],
  '头孢类': ['头孢克肟', '头孢曲松', '头孢呋辛', '头孢氨苄'],
}

const contraindicationMap: Record<string, Array<{ condition: string; drugs: string[]; level: '禁忌' | '警告'; message: string }>> = {
  'I10': [],
  'E11.9': [
    { condition: '2型糖尿病', drugs: ['地塞米松', '泼尼松', '氢化可的松'], level: '警告', message: '糖皮质激素可升高血糖，糖尿病患者使用需加强血糖监测和降糖治疗' },
  ],
  'J45.9': [
    { condition: '支气管哮喘', drugs: ['普萘洛尔', '美托洛尔'], level: '禁忌', message: 'β受体阻滞剂可诱发或加重支气管哮喘，哮喘患者禁用非选择性β受体阻滞剂，慎用选择性β1受体阻滞剂' },
  ],
  'K25.9': [
    { condition: '消化性溃疡', drugs: ['布洛芬', '阿司匹林', '双氯芬酸'], level: '警告', message: 'NSAIDs和阿司匹林可损伤胃黏膜，消化性溃疡患者使用需加用PPI保护' },
  ],
  'O26.9': [
    { condition: '妊娠', drugs: ['华法林', '甲氨蝶呤', '利巴韦林', 'ACEI', '依那普利'], level: '禁忌', message: '妊娠期禁用致畸药物，华法林可致胎儿华法林综合征，ACEI可致胎儿肾发育不良' },
  ],
}

const labReferenceRanges: Record<string, { min: number; max: number; unit: string; lowSignificance: string; highSignificance: string; criticalLow?: string; criticalHigh?: string }> = {
  '白细胞计数': { min: 4.0, max: 10.0, unit: '×10^9/L', lowSignificance: '白细胞减少：可能为病毒感染、骨髓抑制、免疫缺陷、药物影响', highSignificance: '白细胞升高：提示感染、炎症、应激反应、白血病可能', criticalHigh: '白细胞>30×10^9/L需排除白血病' },
  '血红蛋白': { min: 120, max: 160, unit: 'g/L', lowSignificance: '贫血：根据MCV进一步分类，需查明原因', highSignificance: '血红蛋白升高：脱水、真性红细胞增多症', criticalLow: 'Hb<70g/L建议输血' },
  '血小板计数': { min: 100, max: 300, unit: '×10^9/L', lowSignificance: '血小板减少：出血风险增加，需排除ITP、DIC等', highSignificance: '血小板升高：反应性增多或骨髓增殖性疾病' },
  '空腹血糖': { min: 3.9, max: 6.1, unit: 'mmol/L', lowSignificance: '低血糖：需紧急处理，查明原因', highSignificance: '血糖升高：糖尿病、应激性高血糖', criticalLow: '血糖<2.8mmol/L为严重低血糖', criticalHigh: '血糖>22.2mmol/L需紧急处理' },
  '糖化血红蛋白': { min: 4.0, max: 6.0, unit: '%', lowSignificance: 'HbA1c降低：频繁低血糖或溶血性贫血', highSignificance: 'HbA1c升高：近2-3月血糖控制不佳，>7.0%需调整治疗方案' },
  '总胆固醇': { min: 2.8, max: 5.7, unit: 'mmol/L', lowSignificance: '胆固醇降低：营养不良、肝功能严重损害、甲亢', highSignificance: '高胆固醇血症：动脉粥样硬化危险因素，需评估心血管风险' },
  '甘油三酯': { min: 0.3, max: 1.7, unit: 'mmol/L', lowSignificance: '甘油三酯降低：营养不良、甲亢', highSignificance: '高甘油三酯血症：胰腺炎风险(>5.6mmol/L)，动脉粥样硬化危险因素' },
  '低密度脂蛋白': { min: 0, max: 3.4, unit: 'mmol/L', lowSignificance: 'LDL降低：通常为良性', highSignificance: 'LDL升高：动脉粥样硬化的主要危险因素，冠心病患者目标<1.8mmol/L' },
  '高密度脂蛋白': { min: 1.0, max: 1.9, unit: 'mmol/L', lowSignificance: 'HDL降低：心血管保护作用减弱，动脉粥样硬化风险增加', highSignificance: 'HDL升高：通常为保护性因素' },
  '肌酐': { min: 44, max: 97, unit: 'μmol/L', lowSignificance: '肌酐降低：肌肉量减少、妊娠', highSignificance: '肌酐升高：肾功能损害，需评估eGFR和分期' },
  '尿素氮': { min: 2.9, max: 8.2, unit: 'mmol/L', lowSignificance: '尿素氮降低：肝功能损害、营养不良', highSignificance: '尿素氮升高：肾功能损害、脱水、消化道出血、高蛋白饮食' },
  '谷丙转氨酶': { min: 0, max: 40, unit: 'U/L', lowSignificance: 'ALT降低：通常无临床意义', highSignificance: 'ALT升高：肝细胞损害，需排除病毒性肝炎、药物性肝损、脂肪肝等' },
  '谷草转氨酶': { min: 0, max: 40, unit: 'U/L', lowSignificance: 'AST降低：通常无临床意义', highSignificance: 'AST升高：肝细胞损害或心肌损害，AST/ALT比值有鉴别意义' },
  '血钾': { min: 3.5, max: 5.3, unit: 'mmol/L', lowSignificance: '低钾血症：乏力、心律失常，需补钾', highSignificance: '高钾血症：心律失常风险，需紧急处理', criticalLow: '血钾<2.5mmol/L可致严重心律失常', criticalHigh: '血钾>6.5mmol/L可致心脏骤停' },
  '血钠': { min: 135, max: 145, unit: 'mmol/L', lowSignificance: '低钠血症：需评估容量状态', highSignificance: '高钠血症：脱水、尿崩症' },
  '肌钙蛋白I': { min: 0, max: 0.04, unit: 'ng/mL', lowSignificance: '正常', highSignificance: '肌钙蛋白升高：心肌损伤，需排除急性心肌梗死', criticalHigh: '肌钙蛋白>1.0ng/mL高度提示急性心肌梗死' },
  'CK-MB': { min: 0, max: 25, unit: 'U/L', lowSignificance: '正常', highSignificance: 'CK-MB升高：心肌损伤，需结合肌钙蛋白判断', criticalHigh: 'CK-MB>50U/L提示大面积心肌损伤' },
  'BNP': { min: 0, max: 100, unit: 'pg/mL', lowSignificance: '正常，排除心衰可能性大', highSignificance: 'BNP升高：心功能不全，需结合临床评估' },
  'C反应蛋白': { min: 0, max: 10, unit: 'mg/L', lowSignificance: '正常', highSignificance: 'CRP升高：炎症、感染、组织损伤、自身免疫病', criticalHigh: 'CRP>100mg/L提示严重感染或全身炎症反应' },
  '降钙素原': { min: 0, max: 0.05, unit: 'ng/mL', lowSignificance: '正常，细菌感染可能性低', highSignificance: 'PCT升高：细菌感染，>0.5ng/mL提示全身感染，>2ng/mL提示重症感染', criticalHigh: 'PCT>10ng/mL提示脓毒症休克' },
  'FT3': { min: 3.1, max: 6.8, unit: 'pmol/L', lowSignificance: 'FT3降低：甲状腺功能减退', highSignificance: 'FT3升高：甲状腺功能亢进' },
  'FT4': { min: 12.0, max: 22.0, unit: 'pmol/L', lowSignificance: 'FT4降低：甲状腺功能减退', highSignificance: 'FT4升高：甲状腺功能亢进' },
  'TSH': { min: 0.27, max: 4.2, unit: 'mIU/L', lowSignificance: 'TSH降低：甲亢或垂体功能减退', highSignificance: 'TSH升高：甲状腺功能减退' },
  '尿微量白蛋白': { min: 0, max: 30, unit: 'mg/L', lowSignificance: '正常', highSignificance: '尿微量白蛋白升高：早期肾损害标志，糖尿病肾病分期依据', criticalHigh: '尿微量白蛋白>300mg/L为临床蛋白尿期' },
  '嗜酸性粒细胞比例': { min: 0.4, max: 8.0, unit: '%', lowSignificance: '正常', highSignificance: '嗜酸性粒细胞升高：过敏、寄生虫感染、嗜酸性粒细胞增多症' },
  'IgE': { min: 0, max: 100, unit: 'IU/mL', lowSignificance: '正常', highSignificance: 'IgE升高：过敏体质、寄生虫感染、过敏性皮炎、哮喘' },
  'pH值': { min: 7.35, max: 7.45, unit: '-', lowSignificance: '酸中毒：需评估代谢性或呼吸性', highSignificance: '碱中毒：需评估代谢性或呼吸性' },
  '碳酸氢根': { min: 22, max: 27, unit: 'mmol/L', lowSignificance: '代谢性酸中毒或呼吸性碱中毒代偿', highSignificance: '代谢性碱中毒或呼吸性酸中毒代偿' },
  '血酮体': { min: 0, max: 0.6, unit: 'mmol/L', lowSignificance: '正常', highSignificance: '酮体升高：糖尿病酮症酸中毒、饥饿性酮症', criticalHigh: '血酮体>3.0mmol/L提示糖尿病酮症酸中毒' },
  '收缩压': { min: 90, max: 140, unit: 'mmHg', lowSignificance: '低血压：需评估原因', highSignificance: '血压升高：高血压，需分级评估' },
  '舒张压': { min: 60, max: 90, unit: 'mmHg', lowSignificance: '低血压', highSignificance: '血压升高' },
}

export function suggestDiagnosis(
  symptoms: string[],
  chiefComplaint: string,
  medicalHistory?: string
): DiagnosisSuggestion[] {
  const diagnosisScores: Record<string, { code: string; name: string; score: number; evidences: string[]; exams: string[]; matchedSymptoms: string[] }> = {}

  for (const symptom of symptoms) {
    const mappings = symptomDiagnosisMap[symptom]
    if (!mappings) continue
    for (const mapping of mappings) {
      if (!diagnosisScores[mapping.code]) {
        diagnosisScores[mapping.code] = {
          code: mapping.code,
          name: mapping.name,
          score: 0,
          evidences: [],
          exams: [],
          matchedSymptoms: [],
        }
      }
      diagnosisScores[mapping.code].score += mapping.weight
      diagnosisScores[mapping.code].evidences.push(mapping.evidence)
      for (const exam of mapping.exams) {
        if (!diagnosisScores[mapping.code].exams.includes(exam)) {
          diagnosisScores[mapping.code].exams.push(exam)
        }
      }
      if (!diagnosisScores[mapping.code].matchedSymptoms.includes(symptom)) {
        diagnosisScores[mapping.code].matchedSymptoms.push(symptom)
      }
    }
  }

  const maxScore = Math.max(...Object.values(diagnosisScores).map(d => d.score), 1)
  const results = Object.values(diagnosisScores)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(d => {
      const rawConfidence = d.score / maxScore
      const confidence = Math.min(0.98, Math.round((0.4 + rawConfidence * 0.58) * 100) / 100)
      const symptomCount = d.matchedSymptoms.length
      const totalSymptoms = symptoms.length
      let source: 'LLM' | 'KG' | 'RULE' | 'HYBRID'
      if (symptomCount >= 3 && totalSymptoms >= 3) source = 'HYBRID'
      else if (symptomCount >= 2) source = 'KG'
      else if (confidence > 0.8) source = 'RULE'
      else source = 'LLM'

      return {
        icd10_code: d.code,
        icd10_name: d.name,
        confidence,
        evidence: d.evidences,
        source,
        description: `基于患者症状[${d.matchedSymptoms.join('、')}]分析，${d.name}可能性较大。${d.evidences[0]}`,
        related_symptoms: d.matchedSymptoms,
        suggested_exams: d.exams,
      }
    })

  return results
}

export function checkMedications(
  patientId: string,
  medications: Array<{ drugName: string; drugCode?: string }>,
  patientAllergies?: string,
  patientDiagnoses?: Array<{ icd10_code: string; icd10_name: string }>
): MedicationWarning[] {
  const warnings: MedicationWarning[] = []

  if (patientAllergies && patientAllergies !== '无') {
    const allergyList = patientAllergies.split(/[、,，]/).map(a => a.trim())
    for (const allergy of allergyList) {
      const contraindicatedDrugs = allergyDrugMap[allergy]
      if (contraindicatedDrugs) {
        for (const med of medications) {
          for (const cd of contraindicatedDrugs) {
            if (med.drugName.includes(cd) || cd.includes(med.drugName)) {
              warnings.push({
                level: '禁忌',
                type: '药物过敏',
                message: `患者${allergy}过敏，禁止使用${med.drugName}`,
                drugs: [med.drugName],
                detail: `患者过敏史中记录"${allergy}过敏"，${med.drugName}属于${allergy}类药物，使用可能引发严重过敏反应，包括过敏性休克。`,
              })
            }
          }
        }
      }
      if (allergy.includes('青霉素')) {
        for (const med of medications) {
          if (med.drugName.includes('阿莫西林') || med.drugName.includes('氨苄西林') || med.drugName.includes('青霉素')) {
            warnings.push({
              level: '禁忌',
              type: '药物过敏',
              message: `患者青霉素过敏，禁止使用${med.drugName}`,
              drugs: [med.drugName],
              detail: '患者青霉素过敏史，使用青霉素类药物可致严重过敏反应，包括过敏性休克，属绝对禁忌。',
            })
          }
        }
      }
      if (allergy.includes('磺胺')) {
        for (const med of medications) {
          if (med.drugName.includes('磺胺')) {
            warnings.push({
              level: '禁忌',
              type: '药物过敏',
              message: `患者磺胺类过敏，禁止使用${med.drugName}`,
              drugs: [med.drugName],
              detail: '患者磺胺类药物过敏史，使用可致严重皮肤反应(如Stevens-Johnson综合征)。',
            })
          }
        }
      }
    }
  }

  function findMatchingKeys(drugName: string): string[] {
    const keys: string[] = []
    for (const key of Object.keys(drugInteractionDB)) {
      if (drugName === key || drugName.includes(key) || key.includes(drugName)) {
        keys.push(key)
      }
    }
    return keys
  }

  function findMatchingInteractions(interactions: Record<string, { level: any; message: string; detail: string }>, drugName: string): Array<{ interactDrug: string; interaction: any }> {
    const results: Array<{ interactDrug: string; interaction: any }> = []
    for (const [interactDrug, interaction] of Object.entries(interactions)) {
      if (drugName === interactDrug || drugName.includes(interactDrug) || interactDrug.includes(drugName)) {
        results.push({ interactDrug, interaction })
      }
    }
    return results
  }

  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const drug1 = medications[i].drugName
      const drug2 = medications[j].drugName

      const keys1 = findMatchingKeys(drug1)
      for (const key of keys1) {
        const matches = findMatchingInteractions(drugInteractionDB[key], drug2)
        for (const match of matches) {
          const exists = warnings.some(w =>
            w.type === '药物相互作用' &&
            w.drugs &&
            ((w.drugs.includes(drug1) && w.drugs.includes(drug2)) ||
             (w.drugs.includes(drug2) && w.drugs.includes(drug1)))
          )
          if (!exists) {
            warnings.push({
              level: match.interaction.level,
              type: '药物相互作用',
              message: match.interaction.message,
              drugs: [drug1, drug2],
              detail: match.interaction.detail,
            })
          }
        }
      }

      const keys2 = findMatchingKeys(drug2)
      for (const key of keys2) {
        const matches = findMatchingInteractions(drugInteractionDB[key], drug1)
        for (const match of matches) {
          const exists = warnings.some(w =>
            w.type === '药物相互作用' &&
            w.drugs &&
            ((w.drugs.includes(drug1) && w.drugs.includes(drug2)) ||
             (w.drugs.includes(drug2) && w.drugs.includes(drug1)))
          )
          if (!exists) {
            warnings.push({
              level: match.interaction.level,
              type: '药物相互作用',
              message: match.interaction.message,
              drugs: [drug1, drug2],
              detail: match.interaction.detail,
            })
          }
        }
      }
    }
  }

  if (patientDiagnoses) {
    for (const diag of patientDiagnoses) {
      const contraindications = contraindicationMap[diag.icd10_code]
      if (contraindications) {
        for (const ci of contraindications) {
          for (const med of medications) {
            for (const contraindicatedDrug of ci.drugs) {
              if (med.drugName.includes(contraindicatedDrug) || contraindicatedDrug.includes(med.drugName)) {
                warnings.push({
                  level: ci.level,
                  type: '疾病禁忌',
                  message: `${diag.icd10_name}患者${ci.level === '禁忌' ? '禁用' : '慎用'}${med.drugName}`,
                  drugs: [med.drugName],
                  detail: ci.message,
                })
              }
            }
          }
        }
      }
    }
  }

  warnings.sort((a, b) => {
    const levelOrder = { '禁忌': 0, '严重': 1, '警告': 2, '注意': 3 }
    return levelOrder[a.level] - levelOrder[b.level]
  })

  return warnings
}

export function checkDrugInteraction(drug1: string, drug2: string): MedicationWarning | null {
  for (const key1 of Object.keys(drugInteractionDB)) {
    if (drug1 === key1 || drug1.includes(key1) || key1.includes(drug1)) {
      const interactions = drugInteractionDB[key1]
      for (const key2 of Object.keys(interactions)) {
        if (drug2 === key2 || drug2.includes(key2) || key2.includes(drug2)) {
          const interaction = interactions[key2]
          return {
            level: interaction.level,
            type: '药物相互作用',
            message: interaction.message,
            drugs: [drug1, drug2],
            detail: interaction.detail,
          }
        }
      }
    }
  }

  for (const key2 of Object.keys(drugInteractionDB)) {
    if (drug2 === key2 || drug2.includes(key2) || key2.includes(drug2)) {
      const interactions = drugInteractionDB[key2]
      for (const key1 of Object.keys(interactions)) {
        if (drug1 === key1 || drug1.includes(key1) || key1.includes(drug1)) {
          const interaction = interactions[key1]
          return {
            level: interaction.level,
            type: '药物相互作用',
            message: interaction.message,
            drugs: [drug1, drug2],
            detail: interaction.detail,
          }
        }
      }
    }
  }

  return null
}

export function interpretLabResults(
  labResults: Array<{
    test_name: string
    result_value: string
    unit: string
    reference_min: number | null
    reference_max: number | null
    is_abnormal: number
    is_critical: number
  }>
): LabInterpretation[] {
  return labResults.map(result => {
    const ref = labReferenceRanges[result.test_name]
    const numValue = parseFloat(result.result_value)
    const isAbnormal = result.is_abnormal === 1
    const isCritical = result.is_critical === 1

    let clinicalSignificance = ''
    let possibleCauses: string[] = []
    let recommendedActions: string[] = []
    let trendAnalysis = ''

    if (ref) {
      const refRange = `${ref.min}-${ref.max} ${ref.unit}`
      if (isAbnormal && !isNaN(numValue)) {
        if (numValue < ref.min) {
          clinicalSignificance = ref.lowSignificance
          trendAnalysis = `当前结果低于参考范围下限(${ref.min}${ref.unit})，需动态监测变化趋势`
        } else if (numValue > ref.max) {
          clinicalSignificance = ref.highSignificance
          trendAnalysis = `当前结果高于参考范围上限(${ref.max}${ref.unit})，需动态监测变化趋势`
        }
      } else if (isAbnormal) {
        clinicalSignificance = '结果异常，请结合临床判断'
        trendAnalysis = '需动态监测变化趋势'
      } else {
        clinicalSignificance = '结果在正常范围内'
        trendAnalysis = '指标正常，建议定期复查'
      }

      if (isCritical && ref.criticalHigh && !isNaN(numValue) && numValue > ref.max) {
        clinicalSignificance = ref.criticalHigh
        recommendedActions.push('⚠️ 危急值！需立即通知临床医生并紧急处理')
      }
      if (isCritical && ref.criticalLow && !isNaN(numValue) && numValue < ref.min) {
        clinicalSignificance = ref.criticalLow
        recommendedActions.push('⚠️ 危急值！需立即通知临床医生并紧急处理')
      }

      if (result.test_name === '空腹血糖' && !isNaN(numValue)) {
        if (numValue > 7.0) possibleCauses.push('糖尿病', '应激性高血糖')
        if (numValue > 11.1) recommendedActions.push('建议完善糖化血红蛋白及OGTT检查')
        if (numValue < 3.9) {
          possibleCauses.push('降糖药物过量', '胰岛素瘤', '严重肝病')
          recommendedActions.push('立即补充葡萄糖，排查低血糖原因')
        }
      } else if (result.test_name === '肌钙蛋白I' && !isNaN(numValue) && numValue > 0.04) {
        possibleCauses.push('急性心肌梗死', '心肌炎', '肺栓塞', '心力衰竭')
        recommendedActions.push('复查肌钙蛋白动态变化', '完善心电图及心脏超声', '排除急性心肌梗死')
      } else if (result.test_name === 'BNP' && !isNaN(numValue) && numValue > 100) {
        possibleCauses.push('心功能不全', '心力衰竭', '肺心病')
        recommendedActions.push('完善心脏超声评估心功能')
      } else if (result.test_name === '糖化血红蛋白' && !isNaN(numValue) && numValue > 6.0) {
        possibleCauses.push('近2-3月血糖控制不佳')
        if (numValue > 7.0) recommendedActions.push('调整降糖方案，加强血糖监测')
        if (numValue > 9.0) recommendedActions.push('建议胰岛素强化治疗')
      } else if (result.test_name === '血钾' && !isNaN(numValue)) {
        if (numValue > 5.3) {
          possibleCauses.push('肾功能不全', 'ACEI/ARB使用', '酸中毒', '溶血')
          recommendedActions.push('限制钾摄入', '复查血钾', '如>6.5mmol/L需紧急降钾处理')
        }
        if (numValue < 3.5) {
          possibleCauses.push('利尿剂使用', '呕吐腹泻', '低钾性周期性麻痹')
          recommendedActions.push('口服或静脉补钾', '监测心电图变化')
        }
      } else if (result.test_name === '肌酐' && !isNaN(numValue) && numValue > 97) {
        possibleCauses.push('肾功能损害', '脱水', '心力衰竭')
        recommendedActions.push('计算eGFR评估肾功能分期', '避免使用肾毒性药物')
      } else if (result.test_name === '尿微量白蛋白' && !isNaN(numValue) && numValue > 30) {
        possibleCauses.push('糖尿病肾病', '高血压肾损害', '肾小球肾炎')
        recommendedActions.push('计算UACR', '评估糖尿病肾病分期', '使用ACEI/ARB减少蛋白尿')
      } else if (result.test_name === 'C反应蛋白' && !isNaN(numValue) && numValue > 10) {
        possibleCauses.push('细菌感染', '炎症反应', '组织损伤', '自身免疫病')
        if (numValue > 100) recommendedActions.push('CRP显著升高，需积极寻找感染灶')
      } else if (result.test_name === '降钙素原' && !isNaN(numValue) && numValue > 0.05) {
        possibleCauses.push('细菌感染', '脓毒症')
        if (numValue > 0.5) recommendedActions.push('PCT明显升高，提示全身细菌感染，建议使用抗生素')
        if (numValue > 2.0) recommendedActions.push('PCT显著升高，提示重症感染/脓毒症，需ICU评估')
      } else if (result.test_name === 'FT3' && !isNaN(numValue) && numValue > 6.8) {
        possibleCauses.push('甲状腺功能亢进症', 'Graves病')
        recommendedActions.push('完善FT4、TSH', '甲状腺超声', '抗甲状腺药物治疗')
      } else if (result.test_name === 'TSH' && !isNaN(numValue) && numValue < 0.27) {
        possibleCauses.push('甲状腺功能亢进症', '垂体功能减退')
        recommendedActions.push('完善FT3、FT4进一步鉴别')
      } else if (result.test_name === '血红蛋白' && !isNaN(numValue) && numValue < 120) {
        possibleCauses.push('缺铁性贫血', '消化道出血', '慢性病贫血', '肾性贫血')
        if (numValue < 70) recommendedActions.push('Hb<70g/L，建议输血治疗')
        else recommendedActions.push('完善贫血相关检查(铁代谢、叶酸、B12)', '大便隐血检查排除消化道出血')
      } else if (result.test_name === '白细胞计数' && !isNaN(numValue)) {
        if (numValue > 10.0) {
          possibleCauses.push('细菌感染', '炎症反应', '应激反应')
          recommendedActions.push('结合CRP、PCT判断感染类型')
        }
        if (numValue < 4.0) {
          possibleCauses.push('病毒感染', '药物影响', '骨髓抑制')
          recommendedActions.push('复查血常规', '必要时骨髓穿刺')
        }
      } else if (result.test_name === '血酮体' && !isNaN(numValue) && numValue > 0.6) {
        possibleCauses.push('糖尿病酮症酸中毒', '饥饿性酮症')
        if (numValue > 3.0) recommendedActions.push('血酮体显著升高，提示糖尿病酮症酸中毒，需紧急补液及胰岛素治疗')
      } else if (result.test_name === 'pH值' && !isNaN(numValue) && numValue < 7.35) {
        possibleCauses.push('代谢性酸中毒', '糖尿病酮症酸中毒', '乳酸酸中毒', '肾功能不全')
        recommendedActions.push('完善血气分析', '计算阴离子间隙', '针对酸中毒原因治疗')
      }

      if (recommendedActions.length === 0 && isAbnormal) {
        recommendedActions.push('建议复查并动态监测')
      }

      return {
        test_name: result.test_name,
        result_value: result.result_value,
        unit: result.unit,
        reference_range: refRange,
        is_abnormal: isAbnormal,
        is_critical: isCritical,
        clinical_significance: clinicalSignificance || '结果在正常参考范围内，暂无特殊临床意义',
        possible_causes: possibleCauses,
        recommended_actions: recommendedActions,
        trend_analysis: trendAnalysis || '指标正常，建议定期复查',
      }
    }

    return {
      test_name: result.test_name,
      result_value: result.result_value,
      unit: result.unit,
      reference_range: result.reference_min != null && result.reference_max != null
        ? `${result.reference_min}-${result.reference_max} ${result.unit}`
        : '无参考范围',
      is_abnormal: isAbnormal,
      is_critical: isCritical,
      clinical_significance: isAbnormal
        ? '结果异常，请结合临床综合判断'
        : '结果在正常范围内',
      possible_causes: isAbnormal ? ['需结合临床进一步分析'] : [],
      recommended_actions: isAbnormal ? ['建议复查并动态监测'] : [],
      trend_analysis: isAbnormal ? '需动态监测变化趋势' : '指标正常',
    }
  })
}
