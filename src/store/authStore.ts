import { create } from 'zustand';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
  setUser: (user: User) => void;
}

const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL + '/api';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,

  login: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Credenciais inválidas');
      }

      const data = await response.json();
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      set({
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        loading: false,
      });
      
      return true;
    } catch (error) {
      console.error('Erro no login:', error);
      set({ loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  verifyToken: async () => {
    const token = get().token;
    if (!token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        get().logout();
        return false;
      }

      const data = await response.json();
      set({ user: data.user, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      get().logout();
      return false;
    }
  },

  setUser: (user: User) => set({ user }),
}));

// Initialize auth state from localStorage
const savedUser = localStorage.getItem('auth_user');
if (savedUser) {
  try {
    const user = JSON.parse(savedUser);
    useAuthStore.getState().setUser(user);
  } catch (error) {
    localStorage.removeItem('auth_user');
  }
}