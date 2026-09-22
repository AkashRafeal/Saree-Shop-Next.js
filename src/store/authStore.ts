import { create } from 'zustand';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
  roles?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isHydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    try {
      const savedToken = localStorage.getItem('nivicollections_token');
      const savedUser = localStorage.getItem('nivicollections_user');
      if (savedToken && savedUser) {
        set({
          user: JSON.parse(savedUser),
          token: savedToken,
          isAuthenticated: true,
          isHydrated: true,
        });
        return;
      }
    } catch {
      // fallback
    }
    set({ isHydrated: true });
  },

  login: (user: User, token: string) => {
    const normalizedRole = user.role || (user.roles?.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_CUSTOMER');
    const normalizedUser = { ...user, role: normalizedRole };
    if (typeof window !== 'undefined') {
      localStorage.setItem('nivicollections_token', token);
      localStorage.setItem('nivicollections_user', JSON.stringify(normalizedUser));
    }
    set({ user: normalizedUser, token, isAuthenticated: true, isHydrated: true });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('nivicollections_token');
      localStorage.removeItem('nivicollections_user');
    }
    set({ user: null, token: null, isAuthenticated: false, isHydrated: true });
  },
}));
