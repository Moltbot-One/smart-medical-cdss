import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react';
import type { Patient } from '@/types';

const mockPatients: Patient[] = [
  { id: '1', admissionNo: 'ZY20240001', name: '李某某', gender: '男', age: 65, department: '心内科', status: '住院中', phone: '138****1234', bloodType: 'A+', allergies: ['青霉素'], admissionDate: '2024-01-15', bedNo: 'A-301', diagnosis: '急性心肌梗死' },
  { id: '2', admissionNo: 'ZY20240002', name: '王某某', gender: '女', age: 58, department: '肾内科', status: '住院中', phone: '139****5678', bloodType: 'O-', allergies: [], admissionDate: '2024-01-16', bedNo: 'B-205', diagnosis: '慢性肾功能不全' },
  { id: '3', admissionNo: 'MZ20240003', name: '张某某', gender: '男', age: 42, department: '呼吸科', status: '门诊', phone: '137****9012', bloodType: 'B+', allergies: ['磺胺类'], admissionDate: '2024-01-17', diagnosis: '社区获得性肺炎' },
  { id: '4', admissionNo: 'ZY20240004', name: '赵某某', gender: '男', age: 73, department: '消化科', status: '住院中', phone: '136****3456', bloodType: 'AB+', allergies: [], admissionDate: '2024-01-14', bedNo: 'C-102', diagnosis: '消化道出血' },
  { id: '5', admissionNo: 'MZ20240005', name: '孙某某', gender: '女', age: 35, department: '内分泌', status: '门诊', phone: '135****7890', bloodType: 'A-', allergies: ['碘造影剂'], admissionDate: '2024-01-17', diagnosis: '2型糖尿病' },
  { id: '6', admissionNo: 'ZY20240006', name: '周某某', gender: '男', age: 68, department: '心内科', status: '出院', phone: '134****2345', bloodType: 'O+', allergies: [], admissionDate: '2024-01-10', diagnosis: '高血压性心脏病' },
  { id: '7', admissionNo: 'MZ20240007', name: '吴某某', gender: '女', age: 45, department: '呼吸科', status: '门诊', phone: '133****6789', bloodType: 'B-', allergies: ['头孢类'], admissionDate: '2024-01-17', diagnosis: '支气管哮喘' },
  { id: '8', admissionNo: 'ZY20240008', name: '郑某某', gender: '男', age: 55, department: '消化科', status: '住院中', phone: '132****0123', bloodType: 'A+', allergies: [], admissionDate: '2024-01-13', bedNo: 'C-305', diagnosis: '肝硬化' },
];

const statusColor: Record<string, string> = {
  '住院中': 'bg-sky-50 text-sky-600',
  '门诊': 'bg-green-50 text-green-600',
  '出院': 'bg-slate-50 text-slate-500',
};

const PAGE_SIZE = 6;

export default function Patients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockPatients.filter((p) => {
    const matchSearch = !search || p.name.includes(search) || p.admissionNo.includes(search);
    const matchDept = !deptFilter || p.department === deptFilter;
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const departments = [...new Set(mockPatients.map((p) => p.department))];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">患者管理</h2>
        <span className="text-sm text-slate-400">共 {filtered.length} 位患者</span>
      </div>

      <div className="bg-white rounded-lg border border-slate-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="搜索姓名或住院号..."
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">全部科室</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-md text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">全部状态</option>
              <option value="住院中">住院中</option>
              <option value="门诊">门诊</option>
              <option value="出院">出院</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400">住院号</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400">姓名</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400">性别</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400">年龄</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400">科室</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400">状态</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-slate-400">操作</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-sm text-slate-400">
                    <UserIcon className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                    暂无匹配的患者数据
                  </td>
                </tr>
              ) : (
                paginated.map((patient) => (
                  <tr key={patient.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-sm text-slate-500 font-mono">{patient.admissionNo}</td>
                    <td className="px-5 py-3 text-sm text-slate-800 font-medium">{patient.name}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{patient.gender}</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{patient.age}岁</td>
                    <td className="px-5 py-3 text-sm text-slate-600">{patient.department}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${statusColor[patient.status]}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => navigate(`/patients/${patient.id}`)}
                        className="text-xs text-sky-500 hover:text-sky-600 hover:underline"
                      >
                        查看详情
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-50">
            <span className="text-xs text-slate-400">
              第 {page} / {totalPages} 页
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
