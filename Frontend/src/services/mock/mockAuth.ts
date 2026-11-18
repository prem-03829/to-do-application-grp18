import { User, AuthResponse } from '../../types';
import { INITIAL_USER } from './mockData';

const STORAGE_USERS_KEY = 'taskflow_mock_registered_users';
const STORAGE_CURRENT_USER_KEY = 'taskflow_user';
const STORAGE_TOKEN_KEY = 'taskflow_token';

// Helper to get registered users
function getRegisteredUsers(): Array<{ email: string; passwordHash: string; user: User }> {
  const data = localStorage.getItem(STORAGE_USERS_KEY);
  if (!data) {
    // Seed with initial demo user
    const defaultList = [
      {
        email: INITIAL_USER.email.toLowerCase(),
        passwordHash: 'password123',
        user: INITIAL_USER,
      },
      {
        email: 'intern@taskflow.dev',
        passwordHash: 'password123',
        user: {
          id: 'usr_demo_02',
          name: 'College Intern',
          email: 'intern@taskflow.dev',
          role: 'Software Intern',
        },
      },
    ];
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
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate network latency

    const users = getRegisteredUsers();
    const found = users.find(
      (u) => u.email.toLowerCase() === credentials.email.toLowerCase().trim()
    );

    if (!found) {
      // For friendly demo experience: if user signs in with any email during internship demo, create or accept it
      const fallbackUser: User = {
        id: `usr_${Date.now()}`,
        name: credentials.email.split('@')[0].replace(/[._]/g, ' ') || 'Demo User',
        email: credentials.email,
        role: 'Internship Member',
      };
      const token = `mock-jwt-token-${Date.now()}`;
      localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(fallbackUser));
      localStorage.setItem(STORAGE_TOKEN_KEY, token);
      return { user: fallbackUser, token };
    }

    if (found.passwordHash !== credentials.password && credentials.password !== 'password123') {
      throw new Error('Invalid email or password. (Hint: use password123)');
    }

    const token = `mock-jwt-token-${found.user.id}-${Date.now()}`;
    localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(found.user));
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
    return { user: found.user, token };
  },

  async register(data: { name: string; email: string; password: string }): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 350));

    const users = getRegisteredUsers();
    const normalizedEmail = data.email.toLowerCase().trim();

    if (users.some((u) => u.email === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      email: normalizedEmail,
      role: 'College Intern',
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

  async logout(): Promise<void> {
    localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
    localStorage.removeItem(STORAGE_TOKEN_KEY);
  },
};
