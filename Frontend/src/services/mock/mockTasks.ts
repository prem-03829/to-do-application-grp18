import { Task, CreateTaskInput, UpdateTaskInput, TaskFiltersState, DashboardStats } from '../../types';
import { INITIAL_TASKS } from './mockData';
import { isDueToday, isUpcoming } from '../../lib/utils';

const STORAGE_TASKS_KEY = 'taskflow_mock_tasks';

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

const simulateDelay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockTaskService = {
  async getTasks(filters?: Partial<TaskFiltersState>): Promise<Task[]> {
    await simulateDelay(180);
    let tasks = getStoredTasks();

    if (!filters) return tasks;

    // Search query filter (matches title, description, or category)
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.category && t.category.toLowerCase().includes(q))
      );
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
        // createdAt
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return tasks;
  },

  async getTaskById(id: string): Promise<Task> {
    await simulateDelay(150);
    const tasks = getStoredTasks();
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      throw new Error(`Task with ID "${id}" was not found.`);
    }
    return task;
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    await simulateDelay(250);
    const tasks = getStoredTasks();
    const newTask: Task = {
      ...input,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: input.status || 'pending',
      priority: input.priority || 'medium',
    };

    const updatedTasks = [newTask, ...tasks];
    saveStoredTasks(updatedTasks);
    return newTask;
  },

  async updateTask(id: string, updates: UpdateTaskInput): Promise<Task> {
    await simulateDelay(200);
    const tasks = getStoredTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Task with ID "${id}" was not found.`);
    }

    const updatedTask: Task = {
      ...tasks[index],
      ...updates,
    };

    tasks[index] = updatedTask;
    saveStoredTasks(tasks);
    return updatedTask;
  },

  async deleteTask(id: string): Promise<void> {
    await simulateDelay(200);
    const tasks = getStoredTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    if (filtered.length === tasks.length) {
      throw new Error(`Task with ID "${id}" was not found.`);
    }
    saveStoredTasks(filtered);
  },

  async toggleTaskStatus(id: string): Promise<Task> {
    await simulateDelay(150);
    const tasks = getStoredTasks();
    const index = tasks.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error(`Task with ID "${id}" was not found.`);
    }

    const current = tasks[index];
    // Toggle: if completed -> pending; if pending or in_progress -> completed
    const nextStatus = current.status === 'completed' ? 'pending' : 'completed';

    const updated: Task = {
      ...current,
      status: nextStatus,
    };

    tasks[index] = updated;
    saveStoredTasks(tasks);
    return updated;
  },

  async getDashboardStats(): Promise<DashboardStats> {
    await simulateDelay(150);
    const tasks = getStoredTasks();
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

  // Reset to initial demo dataset (useful for testing)
  resetDemoData(): void {
    localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(INITIAL_TASKS));
  },
};
