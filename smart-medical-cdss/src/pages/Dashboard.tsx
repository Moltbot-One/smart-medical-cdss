import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  FileCheck,
  AlertTriangle,
  Brain,
  TrendingUp,
  TrendingDown,
  Pill,
  TestTube2,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { Alert, DashboardStats } from '@/types';

echarts.use([LineChart, PieChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

const mockStats: DashboardStats = {
  todayEncounters: 42,
  pendingReviews: 8,
  alertCount: 5,
  aiAssistCount: 23,
  todayEncountersTrend: 12,
  pendingReviewsTrend: -3,
  alertCountTrend: 2,
  aiAssistCountTrend: 18,
};

const mockAlerts: Alert[] = [
  { id: '1', type: '用药预警', severity: '红', title: '阿司匹林与华法林联用禁忌', description: '患者李某某同时使用阿司匹林和华法林，存在严重出血风险', patientName: '李某某', patientId: 'P001', createdAt: '10:30', isRead: false },
  { id: '2', type: '检验异常', severity: '橙', title: '血钾异常升高', description: '患者王某某血钾6.2mmol/L，需紧急处理', patientName: '王某某', patientId: 'P002', createdAt: '10:15', isRead: false },
  { id: '3', type: '诊断提醒', severity: '黄', title: '疑似药物过敏反应', description: '患者张某某使用青霉素后出现皮疹', patientName: '张某某', patientId: 'P003', createdAt: '09:45', isRead: true },
  { id: '4', type: '质控提醒', severity: '蓝', title: '病历书写不完整', description: '3份病历缺少体格检查记录', createdAt: '09:00', isRead: true },
];

const mockEncounters = [
  { id: '1', patientName: '李某某', department: '心内科', doctor: '张医生', type: '门诊', time: '10:30', status: '进行中' },
  { id: '2', patientName: '王某某', department: '肾内科', doctor: '李医生', type: '住院', time: '10:15', status: '进行中' },
  { id: '3', patientName: '张某某', department: '呼吸科', doctor: '王医生', type: '门诊', time: '09:45', status: '已完成' },
  { id: '4', patientName: '赵某某', department: '消化科', doctor: '刘医生', type: '急诊', time: '09:30', status: '进行中' },
  { id: '5', patientName: '孙某某', department: '内分泌', doctor: '陈医生', type: '门诊', time: '09:00', status: '已完成' },
];

const severityColor: Record<string, string> = {
  '红': 'bg-red-500',
  '橙': 'bg-orange-500',
  '黄': 'bg-yellow-500',
  '蓝': 'bg-sky-500',
};

const severityBorder: Record<string, string> = {
  '红': 'border-l-red-500',
  '橙': 'border-l-orange-500',
  '黄': 'border-l-yellow-500',
  '蓝': 'border-l-sky-500',
};

function StatCard({ icon: Icon, label, value, trend, color }: { icon: React.ElementType; label: string; value: number; trend: number; color: string }) {
  const isUp = trend > 0;
  return (
    <div className="bg-white rounded-lg p-5 border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className={`flex items-center gap-1 text-xs ${isUp ? 'text-green-500' : 'text-red-500'}`}>
          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{label}</div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();

  const lineOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: '#e2e8f0' } },
      axisLabel: { color: '#94a3b8', fontSize: 12 },
    },
    yAxis: {
      type: 'value' as const,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#f1f5f9' } },
      axisLabel: { color: '#94a3b8', fontSize: 12 },
    },
    series: [{
      name: '门诊量',
      type: 'line' as const,
      data: [120, 132, 101, 134, 90, 70, 45],
      smooth: true,
      lineStyle: { color: '#0ea5e9', width: 2 },
      itemStyle: { color: '#0ea5e9' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(14,165,233,0.3)' },
          { offset: 1, color: 'rgba(14,165,233,0.02)' },
        ]),
      },
    }],
  };

  const pieOption = {
    tooltip: { trigger: 'item' as const },
    legend: { bottom: '5%', textStyle: { color: '#94a3b8', fontSize: 12 } },
    series: [{
      type: 'pie' as const,
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
      data: [
        { value: 35, name: '心内科', itemStyle: { color: '#0ea5e9' } },
        { value: 28, name: '呼吸科', itemStyle: { color: '#06b6d4' } },
        { value: 22, name: '消化科', itemStyle: { color: '#14b8a6' } },
        { value: 18, name: '肾内科', itemStyle: { color: '#f97316' } },
        { value: 15, name: '内分泌', itemStyle: { color: '#8b5cf6' } },
        { value: 12, name: '其他', itemStyle: { color: '#94a3b8' } },
      ],
    }],
  };

  const quickActions = [
    { icon: Brain, label: '诊断辅助', path: '/diagnosis', color: 'bg-sky-50 text-sky-600' },
    { icon: Pill, label: '用药审核', path: '/medication', color: 'bg-orange-50 text-orange-600' },
    { icon: TestTube2, label: '检查解读', path: '/lab-results', color: 'bg-green-50 text-green-600' },
    { icon: BookOpen, label: '知识检索', path: '/knowledge', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Stethoscope} label="今日接诊" value={mockStats.todayEncounters} trend={mockStats.todayEncountersTrend} color="bg-sky-500" />
        <StatCard icon={FileCheck} label="待审核" value={mockStats.pendingReviews} trend={mockStats.pendingReviewsTrend} color="bg-orange-500" />
        <StatCard icon={AlertTriangle} label="预警提醒" value={mockStats.alertCount} trend={mockStats.alertCountTrend} color="bg-red-500" />
        <StatCard icon={Brain} label="AI辅助次数" value={mockStats.aiAssistCount} trend={mockStats.aiAssistCountTrend} color="bg-violet-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-100 p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">门诊量趋势</h3>
          <ReactEChartsCore echarts={echarts} option={lineOption} style={{ height: 280 }} />
        </div>

        <div className="bg-white rounded-lg border border-slate-100 p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">科室分布</h3>
          <ReactEChartsCore echarts={echarts} option={pieOption} style={{ height: 280 }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-100">
          <div className="flex items-center justify-between p-5 border-b border-slate-50">
            <h3 className="text-base font-semibold text-slate-800">预警提醒</h3>
            <span className="text-xs text-sky-500 cursor-pointer hover:underline">查看全部</span>
          </div>
          <div className="divide-y divide-slate-50">
            {mockAlerts.map((alert) => (
              <div key={alert.id} className={`flex items-start gap-3 p-4 border-l-4 ${severityBorder[alert.severity]} hover:bg-slate-50 transition-colors`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${severityColor[alert.severity]}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">{alert.title}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{alert.type}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 truncate">{alert.description}</p>
                </div>
                <span className="text-xs text-slate-300 flex-shrink-0">{alert.createdAt}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-100 p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">快捷操作</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg ${action.color} hover:shadow-md transition-all`}
              >
                <action.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-100">
        <div className="flex items-center justify-between p-5 border-b border-slate-50">
          <h3 className="text-base font-semibold text-slate-800">最近就诊</h3>
          <button onClick={() => navigate('/patients')} className="flex items-center gap-1 text-xs text-sky-500 hover:underline">
            查看全部 <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-400 border-b border-slate-50">
                <th className="text-left px-5 py-3 font-medium">患者</th>
                <th className="text-left px-5 py-3 font-medium">科室</th>
                <th className="text-left px-5 py-3 font-medium">医生</th>
                <th className="text-left px-5 py-3 font-medium">类型</th>
                <th className="text-left px-5 py-3 font-medium">时间</th>
                <th className="text-left px-5 py-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {mockEncounters.map((enc) => (
                <tr key={enc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 text-sm text-slate-800">{enc.patientName}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{enc.department}</td>
                  <td className="px-5 py-3 text-sm text-slate-600">{enc.doctor}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${enc.type === '急诊' ? 'bg-red-50 text-red-600' : enc.type === '住院' ? 'bg-sky-50 text-sky-600' : 'bg-slate-50 text-slate-600'}`}>
                      {enc.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-400">{enc.time}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${enc.status === '进行中' ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-500'}`}>
                      {enc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
