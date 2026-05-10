import { create } from 'zustand';
import type { User } from '@/types';

interface AppState {
  user: User | null;
  token: string | null;
  sidebarCollapsed: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: JSON.parse(localStorage.getItem('cdss_user') || 'null'),
  token: localStorage.getItem('cdss_token'),
  sidebarCollapsed: false,
  login: (user, token) => {
    localStorage.setItem('cdss_token', token);
    localStorage.setItem('cdss_user', JSON.stringify(user));
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem('cdss_token');
    localStorage.removeItem('cdss_user');
    set({ user: null, token: null });
  },
  setToken: (token) => {
    localStorage.setItem('cdss_token', token);
    set({ token });
  },
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}));
