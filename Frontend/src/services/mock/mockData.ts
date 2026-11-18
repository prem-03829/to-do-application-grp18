import { Task, User } from '../../types';

export const INITIAL_USER: User = {
  id: 'usr_default_01',
  name: 'Rushikesh Jagtap',
  email: 'rushikesh.jagtap@college.edu',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'Frontend Engineering Intern',
};

// Generate dates relative to current day so demo is always fresh
const today = new Date();
const formatDateKey = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(today.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design MySQL Database Schema for TaskFlow Backend',
    description: 'Map out users, tasks, categories, and audit log tables with primary & foreign keys, indexes, and soft-delete support.',
    status: 'in_progress',
    priority: 'high',
    dueDate: formatDateKey(0), // Today
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    category: 'Project Development',
    userId: 'usr_default_01',
  },
  {
    id: 'task-2',
    title: 'Complete Machine Learning Lab Assignment 3',
    description: 'Train Random Forest and Logistic Regression classifiers on the customer churn dataset. Document ROC-AUC curves in Jupyter Notebook.',
    status: 'pending',
    priority: 'high',
    dueDate: formatDateKey(0), // Today
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: 'College Assignment',
    userId: 'usr_default_01',
  },
  {
    id: 'task-3',
    title: 'Sprint Demo & Code Review with Group 18',
    description: 'Present the responsive React + Tailwind frontend layout to the internship mentor and align on Flask REST endpoints.',
    status: 'pending',
    priority: 'medium',
    dueDate: formatDateKey(1), // Tomorrow (Upcoming)
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    category: 'Meeting',
    userId: 'usr_default_01',
  },
  {
    id: 'task-4',
    title: 'Solve 3 Dynamic Programming problems on LeetCode',
    description: 'Practice Coin Change, Longest Common Subsequence, and 0/1 Knapsack to sharpen algorithmic problem solving.',
    status: 'completed',
    priority: 'medium',
    dueDate: formatDateKey(-1), // Yesterday
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    category: 'Coding Practice',
    userId: 'usr_default_01',
  },
  {
    id: 'task-5',
    title: 'Integrate TanStack Query & Optimistic Task Updates',
    description: 'Implement cache invalidation, mutation rollback hooks, and loading skeletons for smooth UX.',
    status: 'in_progress',
    priority: 'high',
    dueDate: formatDateKey(2), // Upcoming
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: 'Project Development',
    userId: 'usr_default_01',
  },
  {
    id: 'task-6',
    title: 'Submit Computer Networks Term Paper (TCP vs UDP)',
    description: 'Format the 6-page research paper in IEEE standard format and upload PDF to the university portal before 5:00 PM.',
    status: 'pending',
    priority: 'low',
    dueDate: formatDateKey(4), // Upcoming
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    category: 'College Assignment',
    userId: 'usr_default_01',
  },
  {
    id: 'task-7',
    title: 'Update GitHub Portfolio & README Documentation',
    description: 'Add live demo links, architecture diagram, stack badges, and setup guide for the TaskFlow repository.',
    status: 'completed',
    priority: 'low',
    dueDate: formatDateKey(-2),
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    category: 'Personal',
    userId: 'usr_default_01',
  },
  {
    id: 'task-8',
    title: 'Setup Flask REST API & CORS Configuration with Teammate',
    description: 'Pair with backend partner to establish JWT authentication headers, CORS origins, and JSON error response structures.',
    status: 'pending',
    priority: 'high',
    dueDate: formatDateKey(3),
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    category: 'Meeting',
    userId: 'usr_default_01',
  },
];

export const CATEGORIES = [
  'College Assignment',
  'Coding Practice',
  'Project Development',
  'Meeting',
  'Personal',
] as const;
