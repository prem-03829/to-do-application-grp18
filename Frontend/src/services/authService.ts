import { apiClient } from '../lib/api';
import { AuthResponse, User, UserRole } from '../types';
import { mockAuthService } from './mock/mockAuth';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export interface LoginPayload {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  adminAccessCode?: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    if (USE_MOCK) {
      return mockAuthService.login(payload);
    }
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    localStorage.setItem('taskflow_token', response.data.token);
    localStorage.setItem('taskflow_user', JSON.stringify(response.data.user));
    return response.data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (USE_MOCK) {
      return mockAuthService.register(payload);
    }
    const response = await apiClient.post<any>('/auth/register', payload);
    let token = response.data?.token;
    let user = response.data?.user || response.data;
    if (!token && user && payload.password) {
      try {
        const loginRes = await apiClient.post<AuthResponse>('/auth/login', {
          email: payload.email,
          password: payload.password,
        });
        token = loginRes.data.token;
        user = loginRes.data.user;
      } catch {
        // If login fails immediately, proceed with available user info
      }
    }
    if (token) {
      localStorage.setItem('taskflow_token', token);
    }
    if (user) {
      localStorage.setItem('taskflow_user', JSON.stringify(user));
    }
    return { token: token || '', user };
  },

  async getCurrentUser(): Promise<User | null> {
    if (USE_MOCK) {
      return mockAuthService.getCurrentUser();
    }
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  },

  async getAllUsers(): Promise<User[]> {
    if (USE_MOCK) {
      return mockAuthService.getAllUsers();
    }
    try {
      const stored = localStorage.getItem('taskflow_user');
      const currentUser = stored ? JSON.parse(stored) : null;
      if (currentUser?.role !== 'admin') {
        return [];
      }
      const response = await apiClient.get<User[]>('/admin/users');
      return response.data;
    } catch {
      return [];
    }
  },

  async logout(): Promise<void> {
    if (USE_MOCK) {
      return mockAuthService.logout();
    }
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
    }
  },
};
