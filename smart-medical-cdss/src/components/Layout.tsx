import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Brain,
  Pill,
  TestTube2,
  ClipboardList,
  ShieldCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  Plus,
  Cross,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: '工作台', icon: LayoutDashboard },
  { path: '/patients', label: '患者管理', icon: Users },
  { path: '/diagnosis', label: '智能诊断', icon: Brain },
  { path: '/medication', label: '用药决策', icon: Pill },
  { path: '/lab-results', label: '检查检验', icon: TestTube2 },
  { path: '/treatment', label: '治疗方案', icon: ClipboardList },
  { path: '/quality', label: '病历质控', icon: ShieldCheck },
  { path: '/knowledge', label: '知识库', icon: BookOpen },
];

const breadcrumbMap: Record<string, string> = {
  '/dashboard': '工作台',
  '/patients': '患者管理',
  '/diagnosis': '智能诊断',
  '/medication': '用药决策',
  '/lab-results': '检查检验',
  '/treatment': '治疗方案',
  '/quality': '病历质控',
  '/knowledge': '知识库',
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, sidebarCollapsed, toggleSidebar, logout } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const currentBreadcrumb = breadcrumbMap[location.pathname] || '工作台';

  const roleLabel = user?.role === 'doctor' ? '医生' : user?.role === 'nurse' ? '护士' : user?.role === 'admin' ? '管理员' : '药师';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside
        className={cn(
          'flex flex-col bg-slate-900 text-white transition-all duration-300 flex-shrink-0',
          sidebarCollapsed ? 'w-16' : 'w-56'
        )}
      >
        <div className={cn('flex items-center h-16 px-4 border-b border-slate-700', sidebarCollapsed ? 'justify-center' : 'gap-3')}>
          <div className="flex items-center justify-center w-8 h-8 bg-sky-500 rounded-md">
            <Plus className="w-5 h-5 text-white" />
          </div>
          {!sidebarCollapsed && <span className="text-lg font-bold tracking-wide">CDSS</span>}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex items-center w-full h-10 text-sm transition-colors',
                  sidebarCollapsed ? 'justify-center px-0' : 'px-4 gap-3',
                  isActive
                    ? 'bg-sky-500 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className={cn('border-t border-slate-700 p-3', sidebarCollapsed ? 'flex justify-center' : '')}>
          <button
            onClick={toggleSidebar}
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-14 px-6 bg-white border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Cross className="w-4 h-4 text-sky-500" />
            <span>智能临床决策支持系统</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-medium">{currentBreadcrumb}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-md text-sm text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors">
              <Search className="w-4 h-4" />
              <span>搜索</span>
              <kbd className="px-1.5 py-0.5 text-xs bg-white border border-slate-200 rounded text-slate-400">Ctrl+K</kbd>
            </div>

            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 hover:bg-slate-50 rounded-md px-2 py-1 transition-colors"
              >
                <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-medium text-slate-700">{user?.name || '用户'}</div>
                  <div className="text-xs text-slate-400">{user?.department || ''} · {roleLabel}</div>
                </div>
              </button>

              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-50">
                    <button
                      onClick={() => { logout(); navigate('/login'); }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
