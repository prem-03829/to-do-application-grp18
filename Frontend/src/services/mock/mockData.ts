import { Task, User } from '../../types';

// Pre-registered active users (Group 18 Internship Team)
export const INITIAL_USERS: User[] = [
  {
    id: 'usr_admin_01',
    name: 'Admin Lead',
    email: 'admin@taskflow.dev',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TaskFlow&backgroundColor=ede9fe',
    role: 'admin',
    department: 'Project Management & Mentorship',
    joinedAt: '2026-10-15',
  },
  {
    id: 'usr_default_01',
    name: 'Rushikesh Jagtap',
    email: 'rushikesh.jagtap@college.edu',
    avatar: 'https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=e0e7ff',
    role: 'user',
    department: 'Frontend Architecture (Group 18)',
    joinedAt: '2026-11-01',
  },
  {
    id: 'usr_priya_02',
    name: 'Priya Sharma',
    email: 'priya.sharma@college.edu',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=dbeafe',
    role: 'user',
    department: 'Backend & Flask APIs (Group 18)',
    joinedAt: '2026-11-03',
  },
  {
    id: 'usr_aarav_03',
    name: 'Aarav Patel',
    email: 'aarav.patel@college.edu',
    avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Milo&backgroundColor=fef3c7',
    role: 'user',
    department: 'DevOps & MySQL Database (Group 18)',
    joinedAt: '2026-11-05',
  },
  {
    id: 'usr_neha_04',
    name: 'Neha Verma',
    email: 'neha.verma@college.edu',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Willow&backgroundColor=d1fae5',
    role: 'user',
    department: 'UI/UX Design & QA Testing (Group 18)',
    joinedAt: '2026-11-08',
  },
];

export const INITIAL_USER = INITIAL_USERS[1]; // Default to Rushikesh Jagtap

// Generate dates relative to current day
const today = new Date();
const formatDateKey = (daysOffset: number): string => {
  const d = new Date();
  d.setDate(today.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS: Task[] = [
  // --- Rushikesh Jagtap's Tasks ---
  {
    id: 'task-1',
    title: 'Design MySQL Database Schema for TaskFlow Backend',
    description: 'Map out users, tasks, categories, and audit log tables with primary & foreign keys, indexes, and soft-delete support.',
    status: 'in_progress', // CURRENTLY WORKING ON
    priority: 'high',
    dueDate: formatDateKey(0), // Today
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    category: 'Project Development',
    userId: 'usr_default_01',
    assignedToName: 'Rushikesh Jagtap',
    assignedToAvatar: INITIAL_USERS[1].avatar,
  },
  {
    id: 'task-2',
    title: 'Complete Machine Learning Lab Assignment 3',
    description: 'Train Random Forest and Logistic Regression classifiers on the customer churn dataset. Document ROC-AUC curves in Jupyter Notebook.',
    status: 'pending',
    priority: 'high',
    dueDate: formatDateKey(0),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: 'College Assignment',
    userId: 'usr_default_01',
    assignedToName: 'Rushikesh Jagtap',
    assignedToAvatar: INITIAL_USERS[1].avatar,
  },
  {
    id: 'task-3',
    title: 'Sprint Demo & Code Review with Group 18',
    description: 'Present the responsive React + Tailwind frontend layout to the internship mentor and align on Flask REST endpoints.',
    status: 'pending',
    priority: 'medium',
    dueDate: formatDateKey(1),
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    category: 'Meeting',
    userId: 'usr_default_01',
    assignedToName: 'Rushikesh Jagtap',
    assignedToAvatar: INITIAL_USERS[1].avatar,
  },
  {
    id: 'task-4',
    title: 'Solve 3 Dynamic Programming problems on LeetCode',
    description: 'Practice Coin Change, Longest Common Subsequence, and 0/1 Knapsack to sharpen algorithmic problem solving.',
    status: 'completed',
    priority: 'medium',
    dueDate: formatDateKey(-1),
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    category: 'Coding Practice',
    userId: 'usr_default_01',
    assignedToName: 'Rushikesh Jagtap',
    assignedToAvatar: INITIAL_USERS[1].avatar,
  },

  // --- Priya Sharma's Tasks ---
  {
    id: 'task-priya-1',
    title: 'Build Flask JWT Authentication Endpoints',
    description: 'Implement /api/auth/login and /api/auth/register with bcrypt password hashing and token expiration handlers.',
    status: 'in_progress', // CURRENTLY WORKING ON
    priority: 'high',
    dueDate: formatDateKey(1),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    category: 'Project Development',
    userId: 'usr_priya_02',
    assignedToName: 'Priya Sharma',
    assignedToAvatar: INITIAL_USERS[2].avatar,
  },
  {
    id: 'task-priya-2',
    title: 'Write Swagger / OpenAPI Documentation for Task Endpoints',
    description: 'Document schema definitions for Task model, query params, and standard HTTP error response format.',
    status: 'completed',
    priority: 'medium',
    dueDate: formatDateKey(-1),
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    category: 'Project Development',
    userId: 'usr_priya_02',
    assignedToName: 'Priya Sharma',
    assignedToAvatar: INITIAL_USERS[2].avatar,
  },
  {
    id: 'task-priya-3',
    title: 'Database Query Optimization & Connection Pooling',
    description: 'Benchmark SQLAlchemy queries with MySQL InnoDB engine and configure max pool sizes.',
    status: 'pending',
    priority: 'low',
    dueDate: formatDateKey(5),
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    category: 'Project Development',
    userId: 'usr_priya_02',
    assignedToName: 'Priya Sharma',
    assignedToAvatar: INITIAL_USERS[2].avatar,
  },

  // --- Aarav Patel's Tasks ---
  {
    id: 'task-aarav-1',
    title: 'Dockerize Frontend & Flask Backend Services',
    description: 'Write Multi-stage Dockerfiles for Vite static build and Python Flask API with docker-compose.yml configuration.',
    status: 'in_progress', // CURRENTLY WORKING ON
    priority: 'high',
    dueDate: formatDateKey(0),
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    category: 'Project Development',
    userId: 'usr_aarav_03',
    assignedToName: 'Aarav Patel',
    assignedToAvatar: INITIAL_USERS[3].avatar,
  },
  {
    id: 'task-aarav-2',
    title: 'Setup GitHub Actions CI/CD Pipeline',
    description: 'Automate linting, TypeScript checking, and unit testing runs on every Pull Request to main branch.',
    status: 'completed',
    priority: 'medium',
    dueDate: formatDateKey(-2),
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    category: 'Project Development',
    userId: 'usr_aarav_03',
    assignedToName: 'Aarav Patel',
    assignedToAvatar: INITIAL_USERS[3].avatar,
  },
  {
    id: 'task-aarav-3',
    title: 'Database Backup & Migration Script',
    description: 'Write automated bash/python script for nightly mysqldump backup to S3 storage bucket.',
    status: 'pending',
    priority: 'low',
    dueDate: formatDateKey(6),
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    category: 'Project Development',
    userId: 'usr_aarav_03',
    assignedToName: 'Aarav Patel',
    assignedToAvatar: INITIAL_USERS[3].avatar,
  },

  // --- Neha Verma's Tasks ---
  {
    id: 'task-neha-1',
    title: 'Conduct Cross-Browser UI & Mobile Responsiveness Audit',
    description: 'Verify layout on Safari iOS, Chrome Android, and Firefox. Ensure drawer navigation behaves cleanly.',
    status: 'in_progress', // CURRENTLY WORKING ON
    priority: 'medium',
    dueDate: formatDateKey(2),
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    category: 'Project Development',
    userId: 'usr_neha_04',
    assignedToName: 'Neha Verma',
    assignedToAvatar: INITIAL_USERS[4].avatar,
  },
  {
    id: 'task-neha-2',
    title: 'Design Recharts Visual Color Scheme & Accessibility Tokens',
    description: 'Tune chart color palettes for high contrast and WCAG AA accessibility compliance.',
    status: 'completed',
    priority: 'medium',
    dueDate: formatDateKey(-1),
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    category: 'Project Development',
    userId: 'usr_neha_04',
    assignedToName: 'Neha Verma',
    assignedToAvatar: INITIAL_USERS[4].avatar,
  },
  {
    id: 'task-neha-3',
    title: 'User Acceptance Testing (UAT) Checklist for Demo',
    description: 'Draft 15-point UAT checklist to test task creation, deletion, status toggles, and filters before mentor evaluation.',
    status: 'completed',
    priority: 'low',
    dueDate: formatDateKey(-3),
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    category: 'College Assignment',
    userId: 'usr_neha_04',
    assignedToName: 'Neha Verma',
    assignedToAvatar: INITIAL_USERS[4].avatar,
  },
];

export const CATEGORIES = [
  'College Assignment',
  'Coding Practice',
  'Project Development',
  'Meeting',
  'Personal',
] as const;
