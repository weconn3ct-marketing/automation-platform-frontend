import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, AuthState, LoginCredentials, SignupCredentials } from '../types';
import { authStorage } from '../lib/storage';
import { api } from '../services/apiClient';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          const response = await api.post<{ user: User; token: string; refreshToken: string }>(
            '/auth/login',
            credentials
          );

          const { user, token, refreshToken } = response.data;

          authStorage.setToken(token);
          authStorage.setUser(user);
          // Store refresh token for later rotation
          localStorage.setItem('refresh_token', refreshToken);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      signup: async (credentials: SignupCredentials) => {
        set({ isLoading: true });
        try {
          const response = await api.post<{ user: User; token: string; refreshToken: string }>(
            '/auth/signup',
            credentials
          );

          const { user, token, refreshToken } = response.data;

          authStorage.setToken(token);
          authStorage.setUser(user);
          localStorage.setItem('refresh_token', refreshToken);

          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            // Revoke the refresh token server-side (best-effort)
            await api.post('/auth/logout', { refreshToken }).catch(() => { });
          }
        } finally {
          authStorage.clearAuth();
          localStorage.removeItem('refresh_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      setUser: (user: User | null) => {
        set({ user });
        if (user) authStorage.setUser(user);
      },

      setToken: (token: string | null) => {
        set({ token });
        if (token) authStorage.setToken(token);
      },

      checkAuth: async () => {
        const token = authStorage.getToken();
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false });
          return;
        }
        try {
          // Validate token against the server and get fresh user data
          const response = await api.get<User>('/auth/me');
          set({
            user: response.data,
            token,
            isAuthenticated: true,
          });
          authStorage.setUser(response.data);
        } catch {
          // Token is invalid/expired — clear auth
          authStorage.clearAuth();
          localStorage.removeItem('refresh_token');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
