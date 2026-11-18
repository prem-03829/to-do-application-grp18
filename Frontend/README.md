# TaskFlow — Modern Productivity & Task Management Frontend

TaskFlow is a modern, responsive, SaaS-grade to-do and productivity application frontend built for our college internship project (Group 18).

It provides an intuitive interface inspired by Linear, Notion, and Todoist, complete with dynamic statistics, interactive Recharts data visualizations, multi-criteria filtering, full task CRUD, and mock authentication with persistent `localStorage` storage.

---

## 🚀 Tech Stack

- **Framework:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite 6](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) inspired design system
- **Routing:** [React Router v6](https://reactrouter.com/)
- **Data Fetching & Caching:** [TanStack Query v5](https://tanstack.com/query)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Toasts:** [Sonner](https://sonner.emilkowal.ski/)
- **HTTP Client:** [Axios](https://axios-http.com/)

---

## 📁 Project Architecture

```
Frontend/
├── public/                 # Static assets & favicon
├── src/
│   ├── components/
│   │   ├── dashboard/      # StatCard, ProductivityChart (Recharts), UpcomingTasks
│   │   ├── layout/         # AppLayout, Sidebar (collapsible/drawer), Header
│   │   ├── tasks/          # TaskItem, TaskCard, TaskList, TaskForm, TaskFilters,
│   │   │                   # TaskStatusBadge, TaskPriorityBadge, TaskDetailModal,
│   │   │                   # DeleteConfirmDialog
│   │   └── ui/             # Button, Input, Textarea, Select, Badge, Card, Modal, Checkbox
│   ├── context/            # AuthContext (login, register, logout, persistent user state)
│   ├── hooks/              # useTasks, useDashboardStats, useCreateTask, useUpdateTask, etc.
│   ├── lib/
│   │   ├── api.ts          # Centralized Axios instance with request/response interceptors
│   │   └── utils.ts        # Date formatting, clsx + twMerge utility (cn)
│   ├── pages/
│   │   ├── DashboardPage.tsx   # Overview with greeting, 4 dynamic stat cards, charts
│   │   ├── TasksPage.tsx       # Full task list with search, filter toolbar, list/grid toggle
│   │   ├── TodayPage.tsx       # Tasks due today with progress completion bar
│   │   ├── UpcomingPage.tsx    # Chronological future deadlines
│   │   ├── CompletedPage.tsx   # Completed tasks archive with instant reopen
│   │   ├── LoginPage.tsx       # Auth login with 1-click Demo Fill & password visibility
│   │   ├── RegisterPage.tsx    # Registration with password requirement checklist
│   │   └── NotFoundPage.tsx    # 404 handler
│   ├── routes/             # AppRoutes, ProtectedRoute, PublicRoute
│   ├── services/
│   │   ├── authService.ts  # Dispatcher (Mock vs Real API)
│   │   ├── taskService.ts  # Dispatcher (Mock vs Real API)
│   │   └── mock/           # mockData.ts, mockAuth.ts, mockTasks.ts
│   ├── types/              # TypeScript interfaces (Task, User, Stats, Filters)
│   ├── App.tsx             # Root Provider & routing setup
│   ├── index.css           # Tailwind CSS v4 design tokens and fonts
│   └── main.tsx            # React DOM mounting
├── .env                    # Environment variables (Mock API toggle & Base URL)
├── .env.example            # Environment template
├── index.html              # HTML shell with Google Fonts
├── package.json            # Scripts & dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration with Tailwind CSS v4 & path alias
```

---

## ⚡ How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🔐 Demo Credentials (Mock Mode)

When opening the login screen, a **"Fill Demo"** button is provided to prefill test credentials:
- **Email:** `rushikesh.jagtap@college.edu`
- **Password:** `password123`

You can also register any new account on the registration page; data persists across page refreshes in `localStorage`.

---

## 🔌 Switching to Flask + MySQL Backend

The application is architected so that switching between **Mock Mode** and the **Flask + MySQL Backend** requires **zero code changes in components**:

1. Open `.env` (or set environment variables in deployment):
   ```env
   VITE_USE_MOCK_API=false
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
2. Restart the Vite development server:
   ```bash
   npm run dev
   ```

### Expected Flask API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user `{ name, email, password }` |
| `POST` | `/api/auth/login` | Authenticate `{ email, password }`, returns `{ token, user }` |
| `GET` | `/api/auth/me` | Current authenticated user profile |
| `POST` | `/api/auth/logout` | Revoke session |
| `GET` | `/api/tasks` | Fetch tasks. Supports query params: `q`, `status`, `priority`, `category`, `sort` |
| `GET` | `/api/tasks/<id>` | Fetch single task by ID |
| `POST` | `/api/tasks` | Create task `{ title, description, priority, status, dueDate, category }` |
| `PUT` | `/api/tasks/<id>` | Update task fields |
| `DELETE` | `/api/tasks/<id>` | Delete task |
| `PATCH` | `/api/tasks/<id>/toggle` | Toggle completion status |
| `GET` | `/api/dashboard/stats` | (Optional) Aggregated statistics |
