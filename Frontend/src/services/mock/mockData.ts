import { Task, User } from '../../types';

// Pre-registered active users (empty for clean team / backend integration)
export const INITIAL_USERS: User[] = [];

// Initial tasks (empty for clean team / backend integration)
export const INITIAL_TASKS: Task[] = [];

export const CATEGORIES = [
  'College Assignment',
  'Coding Practice',
  'Project Development',
  'Meeting',
  'Personal',
] as const;
