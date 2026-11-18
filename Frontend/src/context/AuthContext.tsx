import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService, LoginPayload, RegisterPayload } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    try {
      const storedToken = localStorage.getItem('taskflow_token');
      const storedUser = localStorage.getItem('taskflow_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        // In mock mode, if no user is set, check mock service
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          setToken(localStorage.getItem('taskflow_token') || 'mock-init-token');
        }
      }
    } catch (err) {
      console.error('Failed to restore auth session:', err);
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (credentials: LoginPayload) => {
    const res = await authService.login(credentials);
    setUser(res.user);
    setToken(res.token);
  };

  const register = async (payload: RegisterPayload) => {
    const res = await authService.register(payload);
    setUser(res.user);
    setToken(res.token);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  };

  const refreshUser = async () => {
    const refreshed = await authService.getCurrentUser();
    if (refreshed) {
      setUser(refreshed);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('taskflow_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
