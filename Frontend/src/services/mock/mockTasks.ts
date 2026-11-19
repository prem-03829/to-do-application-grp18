import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFiltersState,
  DashboardStats,
  UserProgress,
} from '../../types';
import { INITIAL_TASKS } from './mockData';
import { mockAuthService } from './mockAuth';
import { isDueToday, isUpcoming } from '../../lib/utils';

const STORAGE_TASKS_KEY = 'taskflow_mock_tasks_v2';

function getStoredTasks(): Task[] {
  const data = localStorage.getItem(STORAGE_TASKS_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(INITIAL_TASKS));
    return INITIAL_TASKS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_TASKS;
  }
}

function saveStoredTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
}

const simulateDelay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockTaskService = {
  async getTasks(filters?: Partial<TaskFiltersState>): Promise<Task[]> {
    await simulateDelay(150);
    let tasks = getStoredTasks();

    if (!filters) return tasks;

    // Search query filter (matches title, description, category, or assigned user)
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (t.assignedToName && t.assignedToName.toLowerCase().includes(q))
      );
    }

    // User ID filter (e.g. for viewing a specific user's tasks)
    if (filters.userId && filters.userId !== 'all') {
      tasks = tasks.filter((t) => t.userId === filters.userId);
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      tasks = tasks.filter((t) => t.status === filters.status);
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      tasks = tasks.filter((t) => t.priority === filters.priority);
    }

    // Category filter
    if (filters.category && filters.category !== 'all') {
      tasks = tasks.filter((t) => t.category === filters.category);
    }

    // Sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    tasks = [...tasks].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'dueDate') {
        comparison = (a.dueDate || '').localeCompare(b.dueDate || '');
      } else if (sortBy === 'priority') {
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        comparison = priorityWeight[a.priority] - priorityWeight[b.priority];
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return tasks;
  },

  async getTaskById(id: string): Promise<Task> {
    await simulateDelay(120);
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      throw new Error(`Task with ID "${id}" was not found.`);
    }
    return task;
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    await simulateDelay(200);
    const tasks = getStoredTasks();

    // Look up assigned user details if userId provided
    const users = await mockAuthService.getAllUsers();
    const assignedUser = users.find((u) => u.id === input.userId);

    const newTask: Task = {
      ...input,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: input.status || 'pending',
      priority: input.priority || 'medium',
      assignedToName: assignedUser?.name || input.assignedToName || 'Unassigned',
      assignedToAvatar: assignedUser?.avatar || input.assignedToAvatar,
    };

    const updatedTasks = [newTask, ...tasks];
    saveStoredTasks(updatedTasks);
    return newTask;
  },

  async updateTask(id: string, updates: UpdateTaskInput): Promise<Task> {
    await simulateDelay(150);
    const tasks = getStoredTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Task with ID "${id}" was not found.`);
    }

    let assignedInfo = {};
    if (updates.userId) {
      const users = await mockAuthService.getAllUsers();
      const user = users.find((u) => u.id === updates.userId);
      if (user) {
        assignedInfo = {
          assignedToName: user.name,
          assignedToAvatar: user.avatar,
        };
      }
    }

    const updatedTask: Task = {
      ...tasks[index],
      ...updates,
      ...assignedInfo,
    };

    tasks[index] = updatedTask;
    saveStoredTasks(tasks);
    return updatedTask;
  },

  async deleteTask(id: string): Promise<void> {
    await simulateDelay(150);
    const tasks = getStoredTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    if (filtered.length === tasks.length) {
      throw new Error(`Task with ID "${id}" was not found.`);
    }
    saveStoredTasks(filtered);
  },

  async toggleTaskStatus(id: string): Promise<Task> {
    await simulateDelay(120);
    const tasks = getStoredTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Task with ID "${id}" was not found.`);
    }

    const current = tasks[index];
    const nextStatus = current.status === 'completed' ? 'pending' : 'completed';

    const updated: Task = {
      ...current,
      status: nextStatus,
    };

    tasks[index] = updated;
    saveStoredTasks(tasks);
    return updated;
  },

  async getDashboardStats(userId?: string): Promise<DashboardStats> {
    await simulateDelay(120);
    let tasks = getStoredTasks();
    if (userId) {
      tasks = tasks.filter((t) => t.userId === userId);
    }

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
  },

  // Admin Feature: Track overall progress and tasks of all registered active users
  async getTeamProgress(): Promise<UserProgress[]> {
    await simulateDelay(150);
    const users = await mockAuthService.getAllUsers();
    const tasks = getStoredTasks();

    return users.map((u) => {
      const userTasks = tasks.filter((t) => t.userId === u.id);
      const inProgressTasks = userTasks.filter((t) => t.status === 'in_progress');
      const otherTasks = userTasks.filter((t) => t.status !== 'in_progress');
      const completedCount = userTasks.filter((t) => t.status === 'completed').length;
      const pendingCount = userTasks.filter((t) => t.status === 'pending').length;
      const inProgressCount = inProgressTasks.length;
      const total = userTasks.length;
      const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      return {
        user: u,
        totalTasks: total,
        inProgressTasks,
        otherTasks,
        completedCount,
        pendingCount,
        inProgressCount,
        completionRate,
      };
    });
  },

  // Reset demo data to seed state
  resetDemoData(): void {
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(INITIAL_TASKS));
  },
};
