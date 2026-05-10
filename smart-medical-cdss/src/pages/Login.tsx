import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Cross } from 'lucide-react';
import { useAppStore } from '@/store';
import { api } from '@/lib/api';

interface LoginResponse {
  code: number;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      username: string;
      name: string;
      role: string;
      department: string;
    };
  };
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAppStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await api.post<LoginResponse>('/auth/login', { username, password });
      if (res.code === 200 && res.data) {
        const roleMap: Record<string, 'doctor' | 'nurse' | 'admin' | 'pharmacist'> = {
          '临床医生': 'doctor',
          '药师': 'pharmacist',
          '管理员': 'admin',
          '护士': 'nurse',
        };
        login(
          {
            id: res.data.user.id,
            username: res.data.user.username,
            name: res.data.user.name,
            role: roleMap[res.data.user.role] || 'doctor',
            department: res.data.user.department,
          },
          res.data.token
        );
        navigate('/');
      } else {
        setError(res.message || '登录失败');
      }
    } catch {
      setError('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-600 to-sky-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-16 h-16 bg-sky-50 rounded-2xl mb-4">
              <Cross className="w-8 h-8 text-sky-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">智能临床决策支持系统</h1>
            <p className="text-sm text-slate-400 mt-1">Smart Clinical Decision Support System</p>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-medium rounded-md text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登录中...
                </>
              ) : (
                '登 录'
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-3">演示账号：</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => fillDemo('doctor1', 'password123')}
                className="px-2 py-2 bg-slate-50 hover:bg-sky-50 border border-slate-200 rounded-md text-xs text-slate-600 transition-colors"
              >
                临床医生
              </button>
              <button
                onClick={() => fillDemo('pharmacist1', 'password123')}
                className="px-2 py-2 bg-slate-50 hover:bg-sky-50 border border-slate-200 rounded-md text-xs text-slate-600 transition-colors"
              >
                药师
              </button>
              <button
                onClick={() => fillDemo('admin', 'password123')}
                className="px-2 py-2 bg-slate-50 hover:bg-sky-50 border border-slate-200 rounded-md text-xs text-slate-600 transition-colors"
              >
                管理员
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-sky-200 mt-6">
          © 2026 智慧医疗CDSS · 仅供医疗专业人员使用
        </p>
      </div>
    </div>
  );
}
