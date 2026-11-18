export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  category?: string;
  userId?: string;
}

export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'userId'>;
export type UpdateTaskInput = Partial<CreateTaskInput>;

export interface TaskFiltersState {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  category: string | 'all';
  sortBy: 'dueDate' | 'createdAt' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface DashboardStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  completionRate: number;
  dueToday: number;
  upcomingCount: number;
}
