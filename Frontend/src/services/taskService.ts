import { apiClient } from '../lib/api';
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFiltersState,
  DashboardStats,
} from '../types';
import { mockTaskService } from './mock/mockTasks';
import { isDueToday, isUpcoming } from '../lib/utils';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const taskService = {
  async getTasks(filters?: Partial<TaskFiltersState>): Promise<Task[]> {
    if (USE_MOCK) {
      return mockTaskService.getTasks(filters);
    }
    const params: Record<string, string | undefined> = {};
    if (filters?.search) params.q = filters.search;
    if (filters?.status && filters.status !== 'all') params.status = filters.status;
    if (filters?.priority && filters.priority !== 'all') params.priority = filters.priority;
    if (filters?.category && filters.category !== 'all') params.category = filters.category;
    if (filters?.sortBy) params.sort = `${filters.sortBy}:${filters.sortOrder || 'desc'}`;

    const response = await apiClient.get<Task[]>('/tasks', { params });
    return response.data;
  },

  async getTask(id: string): Promise<Task> {
    if (USE_MOCK) {
      return mockTaskService.getTaskById(id);
    }
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    if (USE_MOCK) {
      return mockTaskService.createTask(input);
    }
    const response = await apiClient.post<Task>('/tasks', input);
    return response.data;
  },

  async updateTask(id: string, updates: UpdateTaskInput): Promise<Task> {
    if (USE_MOCK) {
      return mockTaskService.updateTask(id, updates);
    }
    const response = await apiClient.put<Task>(`/tasks/${id}`, updates);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    if (USE_MOCK) {
      return mockTaskService.deleteTask(id);
    }
    await apiClient.delete(`/tasks/${id}`);
  },

  async toggleTaskStatus(id: string): Promise<Task> {
    if (USE_MOCK) {
      return mockTaskService.toggleTaskStatus(id);
    }
    // Real API: get current or call dedicated toggle endpoint / patch
    const response = await apiClient.patch<Task>(`/tasks/${id}/toggle`);
    return response.data;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    if (USE_MOCK) {
      return mockTaskService.getDashboardStats();
    }
    try {
      const response = await apiClient.get<DashboardStats>('/dashboard/stats');
      return response.data;
    } catch {
      // Fallback: calculate from all tasks if endpoint not implemented
      const tasks = await this.getTasks();
      const total = tasks.length;
      const pending = tasks.filter((t) => t.status === 'pending').length;
      const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
      const completed = tasks.filter((t) => t.status === 'completed').length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const dueToday = tasks.filter((t) => t.status !== 'completed' && isDueToday(t.dueDate)).length;
      const upcomingCount = tasks.filter((t) => t.status !== 'completed' && isUpcoming(t.dueDate)).length;

      return {
        total,
        pending,
        inProgress,
        completed,
        completionRate,
        dueToday,
        upcomingCount,
      };
    }
  },
};
