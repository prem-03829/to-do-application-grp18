import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '../services/taskService';
import { authService } from '../services/authService';
import {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  TaskFiltersState,
  DashboardStats,
  UserProgress,
  User,
} from '../types';

export const TASK_KEYS = {
  all: ['tasks'] as const,
  lists: () => [...TASK_KEYS.all, 'list'] as const,
  list: (filters?: Partial<TaskFiltersState>) => [...TASK_KEYS.lists(), filters] as const,
  details: () => [...TASK_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...TASK_KEYS.details(), id] as const,
  stats: () => ['dashboard-stats'] as const,
  teamProgress: () => ['team-progress'] as const,
  users: () => ['users'] as const,
};

export function useTasks(filters?: Partial<TaskFiltersState>) {
  return useQuery<Task[], Error>({
    queryKey: TASK_KEYS.list(filters),
    queryFn: () => taskService.getTasks(filters),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useTask(id?: string) {
  return useQuery<Task, Error>({
    queryKey: TASK_KEYS.detail(id || ''),
    queryFn: () => (id ? taskService.getTask(id) : Promise.reject('No ID provided')),
    enabled: !!id,
  });
}

export function useDashboardStats(userId?: string) {
  return useQuery<DashboardStats, Error>({
    queryKey: [...TASK_KEYS.stats(), userId],
    queryFn: () => taskService.getDashboardStats(userId),
    staleTime: 1000 * 20,
  });
}

export function useTeamProgress() {
  return useQuery<UserProgress[], Error>({
    queryKey: TASK_KEYS.teamProgress(),
    queryFn: () => taskService.getTeamProgress(),
    staleTime: 1000 * 15,
  });
}

export function useUsers() {
  return useQuery<User[], Error>({
    queryKey: TASK_KEYS.users(),
    queryFn: () => authService.getAllUsers(),
    staleTime: 1000 * 60,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => taskService.createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.teamProgress() });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateTaskInput }) =>
      taskService.updateTask(id, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.teamProgress() });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.teamProgress() });
    },
  });
}

export function useToggleTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.toggleTaskStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.stats() });
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.teamProgress() });
    },
  });
}
