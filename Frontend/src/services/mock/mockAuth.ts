import { User, AuthResponse, UserRole } from '../../types';
import { INITIAL_USERS } from './mockData';

const STORAGE_USERS_KEY = 'taskflow_users_v3';
const STORAGE_CURRENT_USER_KEY = 'taskflow_user';
const STORAGE_TOKEN_KEY = 'taskflow_token';

// Helper to get registered users
function getRegisteredUsers(): Array<{ email: string; passwordHash: string; user: User }> {
  // Clear any legacy mock user seeds
  try {
    localStorage.removeItem('taskflow_mock_registered_users_v2');
    localStorage.removeItem('taskflow_mock_registered_users');
  } catch {
    // ignore
  }

  const data = localStorage.getItem(STORAGE_USERS_KEY);
  if (!data) {
    const defaultList = INITIAL_USERS.map((u) => ({
      email: u.email.toLowerCase(),
      passwordHash: 'password123',
      user: u,
    }));
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(defaultList));
    return defaultList;
  }
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export const mockAuthService = {
  async login(credentials: { email: string; password: string; role?: UserRole }): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network latency

    const users = getRegisteredUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === credentials.email.toLowerCase().trim()
    );

    if (!found) {
      // Demo fallback: create user on-the-fly with requested role
      const chosenRole: UserRole = credentials.role || 'user';
      const fallbackUser: User = {
        id: `usr_${Date.now()}`,
        name: credentials.email.split('@')[0].replace(/[._]/g, ' ') || 'Demo User',
        email: credentials.email.toLowerCase().trim(),
        role: chosenRole,
        department: chosenRole === 'admin' ? 'Project Administration' : 'Group 18 Member',
        joinedAt: new Date().toISOString().split('T')[0],
      };

      users.push({
        email: credentials.email.toLowerCase().trim(),
        passwordHash: credentials.password,
        user: fallbackUser,
      });
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

      const token = `mock-jwt-token-${Date.now()}`;
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(fallbackUser));
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
      return { user: fallbackUser, token };
    }

    if (found.passwordHash !== credentials.password && credentials.password !== 'password123') {
      throw new Error('Invalid email or password. (Hint: use password123)');
    }

    // If explicit role is selected at login, update user session
    let activeUser = found.user;
    if (credentials.role && credentials.role !== activeUser.role) {
      activeUser = { ...activeUser, role: credentials.role };
      found.user = activeUser;
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
    }

    const token = `mock-jwt-token-${activeUser.id}-${Date.now()}`;
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(activeUser));
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    return { user: activeUser, token };
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    adminAccessCode?: string;
  }): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    const users = getRegisteredUsers();
    const normalizedEmail = data.email.toLowerCase().trim();

    if (users.some((u) => u.email === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const assignedRole: UserRole = data.role || 'user';

    // Verify Admin Access Code if registering with admin role
    if (assignedRole === 'admin') {
      const configuredCode = (import.meta.env.VITE_ADMIN_ACCESS_CODE || '').trim();
      const enteredCode = (data.adminAccessCode || '').trim();

      if (!enteredCode) {
        throw new Error('Admin Access Code is required to create an admin account.');
      }

      if (configuredCode && enteredCode !== configuredCode) {
        throw new Error('Invalid Admin Access Code. Please enter the correct authorization code.');
      }
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: normalizedEmail,
      role: assignedRole,
      department: assignedRole === 'admin' ? 'Project Administration' : 'Group 18 Member',
      avatar: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=e0e7ff`,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    users.push({
      email: normalizedEmail,
      passwordHash: data.password,
      user: newUser,
    });
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));

    const token = `mock-jwt-token-${newUser.id}-${Date.now()}`;
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(newUser));
    localStorage.setItem(STORAGE_TOKEN_KEY, token);

    return { user: newUser, token };
  },

  async getCurrentUser(): Promise<User | null> {
    const stored = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    if (!stored || !token) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  async getAllUsers(): Promise<User[]> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const usersWithCreds = getRegisteredUsers();
    return usersWithCreds.map((u) => u.user);
  },

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  },
};
