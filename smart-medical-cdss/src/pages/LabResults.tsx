import { useState } from 'react';
import { TestTube2, TrendingUp, AlertTriangle } from 'lucide-react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { LabResult } from '@/types';

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const mockLabResults: LabResult[] = [
  { id: '1', encounterId: 'E1', patientId: '1', testName: '肌钙蛋白I', testCode: 'cTnI', value: 5.8, unit: 'ng/mL', referenceRange: '0-0.04', lowBound: 0, highBound: 0.04, isAbnormal: true, isCritical: true, direction: 'high', testDate: '2024-01-15', category: '心肌标志物', clinicalSignificance: '显著升高，提示急性心肌损伤，需紧急处理' },
  { id: '2', encounterId: 'E1', patientId: '1', testName: 'CK-MB', testCode: 'CKMB', value: 85, unit: 'U/L', referenceRange: '0-25', lowBound: 0, highBound: 25, isAbnormal: true, isCritical: false, direction: 'high', testDate: '2024-01-15', category: '心肌标志物', clinicalSignificance: '升高，提示心肌损伤' },
  { id: '3', encounterId: 'E1', patientId: '1', testName: '血红蛋白', testCode: 'HGB', value: 128, unit: 'g/L', referenceRange: '120-160', lowBound: 120, highBound: 160, isAbnormal: false, isCritical: false, testDate: '2024-01-15', category: '血常规' },
  { id: '4', encounterId: 'E1', patientId: '1', testName: '白细胞', testCode: 'WBC', value: 11.5, unit: '×10⁹/L', referenceRange: '4-10', lowBound: 4, highBound: 10, isAbnormal: true, isCritical: false, direction: 'high', testDate: '2024-01-15', category: '血常规', clinicalSignificance: '轻度升高，可能存在感染或应激反应' },
  { id: '5', encounterId: 'E1', patientId: '1', testName: '血钾', testCode: 'K', value: 3.2, unit: 'mmol/L', referenceRange: '3.5-5.3', lowBound: 3.5, highBound: 5.3, isAbnormal: true, isCritical: false, direction: 'low', testDate: '2024-01-15', category: '电解质', clinicalSignificance: '轻度低钾血症，需补钾治疗' },
  { id: '6', encounterId: 'E1', patientId: '1', testName: '血钠', testCode: 'Na', value: 140, unit: 'mmol/L', referenceRange: '137-147', lowBound: 137, highBound: 147, isAbnormal: false, isCritical: false, testDate: '2024-01-15', category: '电解质' },
  { id: '7', encounterId: 'E1', patientId: '1', testName: '肌酐', testCode: 'Cr', value: 135, unit: 'μmol/L', referenceRange: '57-111', lowBound: 57, highBound: 111, isAbnormal: true, isCritical: false, direction: 'high', testDate: '2024-01-15', category: '肾功能', clinicalSignificance: '升高，提示肾功能受损，需排除造影剂肾病' },
  { id: '8', encounterId: 'E1', patientId: '1', testName: 'BNP', testCode: 'BNP', value: 890, unit: 'pg/mL', referenceRange: '0-100', lowBound: 0, highBound: 100, isAbnormal: true, isCritical: true, direction: 'high', testDate: '2024-01-15', category: '心功能', clinicalSignificance: '显著升高，提示心力衰竭' },
  { id: '9', encounterId: 'E1', patientId: '1', testName: '血糖', testCode: 'GLU', value: 8.5, unit: 'mmol/L', referenceRange: '3.9-6.1', lowBound: 3.9, highBound: 6.1, isAbnormal: true, isCritical: false, direction: 'high', testDate: '2024-01-15', category: '代谢', clinicalSignificance: '空腹血糖升高，需关注血糖控制' },
  { id: '10', encounterId: 'E1', patientId: '1', testName: '血小板', testCode: 'PLT', value: 198, unit: '×10⁹/L', referenceRange: '100-300', lowBound: 100, highBound: 300, isAbnormal: false, isCritical: false, testDate: '2024-01-15', category: '血常规' },
];

const trendData: Record<string, { dates: string[]; values: number[] }> = {
  'cTnI': { dates: ['01-13', '01-14', '01-15', '01-16', '01-17'], values: [0.02, 0.05, 5.8, 3.2, 1.1] },
  'CKMB': { dates: ['01-13', '01-14', '01-15', '01-16', '01-17'], values: [15, 22, 85, 45, 20] },
  'K': { dates: ['01-13', '01-14', '01-15', '01-16', '01-17'], values: [4.0, 3.8, 3.2, 3.5, 3.8] },
};

export default function LabResults() {
  const [encounter, setEncounter] = useState('E1');
  const [selectedTest, setSelectedTest] = useState<string | null>(null);

  const criticalResults = mockLabResults.filter((r) => r.isCritical);
  const abnormalResults = mockLabResults.filter((r) => r.isAbnormal && !r.isCritical);

  const categories = [...new Set(mockLabResults.map((r) => r.category))];

  const getTrendOption = () => {
    if (!selectedTest || !trendData[selectedTest]) return {};
    const data = trendData[selectedTest];
    const result = mockLabResults.find((r) => r.testCode === selectedTest);
    return {
      tooltip: { trigger: 'axis' as const },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
      xAxis: { type: 'category' as const, data: data.dates, axisLine: { lineStyle: { color: '#e2e8f0' } }, axisLabel: { color: '#94a3b8', fontSize: 12 } },
      yAxis: { type: 'value' as const, axisLine: { show: false }, splitLine: { lineStyle: { color: '#f1f5f9' } }, axisLabel: { color: '#94a3b8', fontSize: 12 } },
      series: [{
        name: result?.testName || '',
        type: 'line' as const,
        data: data.values,
        smooth: true,
        lineStyle: { color: '#0ea5e9', width: 2 },
        itemStyle: { color: '#0ea5e9' },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(14,165,233,0.2)' }, { offset: 1, color: 'rgba(14,165,233,0.02)' }]) },
        markLine: result ? {
          silent: true,
          lineStyle: { color: '#ef4444', type: 'dashed' as const },
          data: [
            { yAxis: result.highBound, name: '上限' },
            { yAxis: result.lowBound, name: '下限' },
          ],
          label: { fontSize: 10, color: '#94a3b8' },
        } : undefined,
      }],
    };
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">检查检验</h2>
        <select
          value={encounter}
          onChange={(e) => setEncounter(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="E1">李某某 - 住院 2024-01-15</option>
          <option value="E2">王某某 - 住院 2024-01-16</option>
          <option value="E3">张某某 - 门诊 2024-01-17</option>
        </select>
      </div>

      {criticalResults.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-bold text-red-700">危急值</span>
          </div>
          <div className="space-y-2">
            {criticalResults.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-white rounded-md px-4 py-2 border border-red-100">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-800">{r.testName}</span>
                  <span className="text-sm text-red-600 font-bold">{r.value} {r.unit} ↑</span>
                  <span className="text-xs text-slate-400">参考: {r.referenceRange} {r.unit}</span>
                </div>
                <span className="text-xs text-red-600">{r.clinicalSignificance}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-slate-700">检验结果</span>
                <div className="flex gap-1">
                  {categories.map((cat) => (
                    <span key={cat} className="text-xs px-2 py-0.5 bg-slate-50 text-slate-500 rounded">{cat}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-slate-400 border-b border-slate-50">
                    <th className="text-left px-5 py-2.5 font-medium">项目</th>
                    <th className="text-left px-5 py-2.5 font-medium">结果</th>
                    <th className="text-left px-5 py-2.5 font-medium">参考范围</th>
                    <th className="text-left px-5 py-2.5 font-medium">分类</th>
                    <th className="text-left px-5 py-2.5 font-medium">趋势</th>
                  </tr>
                </thead>
                <tbody>
                  {mockLabResults.map((result) => (
                    <tr
                      key={result.id}
                      className={`border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${
                        selectedTest === result.testCode ? 'bg-sky-50' : ''
                      } ${result.isCritical ? 'bg-red-50/50' : ''}`}
                      onClick={() => setSelectedTest(result.testCode === selectedTest ? null : result.testCode)}
                    >
                      <td className="px-5 py-2.5 text-sm text-slate-800">{result.testName}</td>
                      <td className="px-5 py-2.5 text-sm">
                        <span className={result.isAbnormal ? (result.direction === 'high' ? 'text-red-600 font-medium' : 'text-blue-600 font-medium') : 'text-slate-700'}>
                          {result.value} {result.unit}
                          {result.direction === 'high' && <span className="text-red-500 ml-0.5">↑</span>}
                          {result.direction === 'low' && <span className="text-blue-500 ml-0.5">↓</span>}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-sm text-slate-400">{result.referenceRange} {result.unit}</td>
                      <td className="px-5 py-2.5 text-xs text-slate-500">{result.category}</td>
                      <td className="px-5 py-2.5">
                        {trendData[result.testCode] && (
                          <TrendingUp className="w-4 h-4 text-sky-400" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {abnormalResults.length > 0 && (
            <div className="mt-4 bg-white rounded-lg border border-slate-100 p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">异常值临床意义</h3>
              <div className="space-y-2">
                {abnormalResults.map((r) => (
                  <div key={r.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-md">
                    <span className={`text-xs font-medium mt-0.5 ${r.direction === 'high' ? 'text-red-500' : 'text-blue-500'}`}>
                      {r.testName}
                    </span>
                    <p className="text-xs text-slate-600">{r.clinicalSignificance}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">趋势图</h3>
            {selectedTest && trendData[selectedTest] ? (
              <ReactEChartsCore echarts={echarts} option={getTrendOption()} style={{ height: 250 }} />
            ) : (
              <div className="h-[250px] flex items-center justify-center">
                <div className="text-center">
                  <TestTube2 className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">点击有趋势标记的检验项目查看趋势</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">异常统计</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">危急值</span>
                <span className="text-sm font-bold text-red-600">{criticalResults.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">异常值</span>
                <span className="text-sm font-bold text-orange-600">{abnormalResults.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">正常值</span>
                <span className="text-sm font-bold text-green-600">{mockLabResults.filter((r) => !r.isAbnormal).length}</span>
              </div>
              <div className="pt-2 border-t border-slate-50">
                <div className="flex h-2 rounded-full overflow-hidden">
                  <div className="bg-red-500" style={{ width: `${(criticalResults.length / mockLabResults.length) * 100}%` }} />
                  <div className="bg-orange-400" style={{ width: `${(abnormalResults.length / mockLabResults.length) * 100}%` }} />
                  <div className="bg-green-400" style={{ width: `${(mockLabResults.filter((r) => !r.isAbnormal).length / mockLabResults.length) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
