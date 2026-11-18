import { apiClient } from '../lib/api';
import { AuthResponse, User } from '../types';
import { mockAuthService } from './mock/mockAuth';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
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
    const response = await apiClient.post<AuthResponse>('/auth/register', payload);
    localStorage.setItem('taskflow_token', response.data.token);
    localStorage.setItem('taskflow_user', JSON.stringify(response.data.user));
    return response.data;
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
