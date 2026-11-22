# TaskFlow: Full-Stack To-Do & Productivity Management Application

TaskFlow is a full-stack, multi-user task management and productivity application developed by Group 18 as an internship project. The application implements strict per-user data isolation alongside administrative oversight capabilities. The system is built with a React 18 and TypeScript single-page application powered by Vite and Tailwind CSS on the frontend; a Python Flask REST API utilizing SQLAlchemy ORM and Flask-JWT-Extended authentication on the backend; and a relational MySQL 8 database enforcing data integrity via foreign keys, cascading rules, and native check constraints. TaskFlow supports two distinct account roles: standard Users, who manage personal tasks, categories, deadlines, and dashboard analytics; and Administrators, who monitor team-wide progress, inspect individual user task loads, and directly assign tasks to team members.

---

## Table of Contents

1. [Features](#1-features)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Project Structure](#4-project-structure)
5. [Prerequisites](#5-prerequisites)
6. [Getting Started](#6-getting-started)
7. [Using the Application](#7-using-the-application)
8. [API Reference](#8-api-reference)
9. [Database](#9-database)
10. [Testing](#10-testing)
11. [Security Notes](#11-security-notes)
12. [Troubleshooting](#12-troubleshooting)
13. [Git Workflow and Branches](#13-git-workflow-and-branches)
14. [Team and Media](#14-team-and-media)
15. [Known Limitations and Possible Improvements](#15-known-limitations-and-possible-improvements)

---

## 1. Features

### User Features
- **Account Registration & Authentication**: User registration with input validation (minimum 6-character password, valid email syntax, rejection of duplicates) and secure login returning JSON Web Tokens (JWT).
- **Task Lifecycle Management**: Full CRUD operations for tasks (create, view, update, toggle completion status, delete).
- **Task Attributes**: Tasks include title, description, status (`pending`, `in_progress`, `completed`), priority (`low`, `medium`, `high`), due date (`dueDate`), and optional category.
- **Instant Status Toggle**: Fast one-click status flipping between `pending` and `completed` (`PATCH /api/tasks/<id>/toggle`).
- **Filtering, Search & Sorting**:
  - Filter tasks by status (`pending`, `in_progress`, `completed`), priority (`low`, `medium`, `high`), or category.
  - Search task titles and descriptions using keyword queries (`?q=keyword`).
  - Sort tasks chronologically or alphabetically in ascending or descending order (`?sort=field:order`).
- **Productivity Dashboard**: Personal metrics overview with dynamic stat cards (Total Tasks, In Progress, Pending, Completed, Completion Rate) and interactive Recharts visualizations.
- **Dedicated Task Views**:
  - **All Tasks** (`/tasks`): Unified view with search bar, filter controls, and list/grid display toggle.
  - **Today** (`/today`): Tasks scheduled for the current date with a completion progress bar.
  - **Upcoming** (`/upcoming`): Chronological breakdown of future scheduled tasks.
  - **Completed** (`/completed`): Archive of completed tasks with reopening capability.
- **User Profile** (`/profile`): View account information, select dynamic animated avatar presets, and inspect connection status (avatar and department stored client-side).

### Admin Features
- **Admin Authentication**: Access to administrative capabilities using seeded administrator credentials.
- **User Directory**: View all registered users with aggregate task statistics, active work counts, completed counts, and percentage completion (`GET /api/admin/users`).
- **User Task Inspection**: Inspect tasks assigned to or created by any specific user, with optional status filtering (`GET /api/admin/users/<id>/tasks`).
- **Team Progress Hub** (`/admin`): Administrative dashboard displaying overall team stats (Total Members, Active Working Tasks, Total Assigned Tasks, Completed Tasks) and expandable user progress cards (`GET /api/admin/team-progress`, `GET /api/admin/stats`).
- **Task Assignment**: Administrators can assign tasks directly to any registered team member by specifying the target `userId` in the task creation form (`POST /api/tasks`).
- **Cross-User Task Retrieval**: Administrators can retrieve details for any task by ID (`GET /api/tasks/<id>`) without receiving a 404 error.

### Role Rules and Access Boundaries
- **Standard Users**:
  - Can only view, create, edit, toggle, and delete their own tasks.
  - Cannot access any administrative endpoints under `/api/admin/*` (returns `403 Forbidden`).
  - If a standard user submits a payload containing another user's `userId`, the backend ignores the field and enforces ownership to the authenticated caller.
- **Administrators**:
  - Can access all administrative endpoints under `/api/admin/*`.
  - Can inspect the task lists and progress of all users.
  - Can view any individual task across the system by ID via `GET /api/tasks/<id>`.
  - Can assign new tasks to specific users during task creation.
  - **Modification Restriction**: Administrators **cannot** update (`PUT /api/tasks/<id>`), toggle (`PATCH /api/tasks/<id>/toggle`), or delete (`DELETE /api/tasks/<id>`) tasks owned by other users. The backend routes enforce `Task.user_id == uid()` for update and delete operations to preserve data ownership integrity.

---

## 2. Tech Stack

| Layer | Technology | Purpose | Version |
|---|---|---|---|
| Frontend Framework | React | Declarative UI component library | 18.3.1 |
| Language (Frontend) | TypeScript | Static typing and interfaces | 5.6.3 |
| Build Tool / Bundler | Vite | Development server and asset bundling | 6.0.3 |
| Styling | Tailwind CSS | Utility-first CSS styling framework | 4.0.0 |
| Client Routing | React Router DOM | Single-page application routing | 6.28.0 |
| Data Fetching & Cache | TanStack Query | Server state synchronization and caching | 5.62.8 |
| Forms & Validation | React Hook Form + Zod | Form management and client-side validation | 7.54.1 / 3.24.1 |
| Data Visualization | Recharts | Charting for productivity statistics | 2.15.0 |
| UI Icons & Feedback | Lucide React / Sonner | Vector iconography and toast notifications | 0.468.0 / 1.7.1 |
| HTTP Client | Axios | HTTP client with JWT interceptors | 1.7.9 |
| Backend Framework | Flask | Python WSGI web application framework | 3.1.3 |
| ORM | Flask-SQLAlchemy | SQL object-relational mapping | 3.1.1 |
| Database Migrations | Flask-Migrate | Database schema migrations via Alembic | 4.1.0 |
| Database Connector | PyMySQL + cryptography | Pure-Python MySQL driver and auth crypto | 1.2.4 / 50.0.2 |
| Authentication | Flask-JWT-Extended | JWT token generation, auth, and revocation | 4.7.4 |
| Cross-Origin Sharing | Flask-CORS | Cross-origin resource sharing configuration | 6.0.5 |
| Serialization | Marshmallow | Object serialization and schema validation | 4.3.1 |
| Environment | python-dotenv | Environment variable loading from `.env` | 1.2.4 |
| Backend Testing | pytest | Unit, integration, and regression testing | 9.2.0 |
| Database Engine | MySQL Server | Relational database with CHECK constraints | 8.0.16+ |

---

## 3. Architecture

### System Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Browser Tier (Client)"]
        UI["React 18 + TypeScript (Vite)"]
        Router["React Router v6"]
        Query["TanStack Query Cache"]
        AxiosClient["Axios HTTP Client (JWT Interceptor)"]
        UI --> Router
        Router --> Query
        Query --> AxiosClient
    end

    subgraph Server ["Application Tier (Flask Backend)"]
        Gateway["Flask App Factory (CORS / JWT Manager)"]
        Routes["Routes Layer (Blueprints: auth, tasks, admin, dashboard)"]
        AuthGuard["JWT Auth & Role Guard (@admin_only, uid())"]
        Services["Service Layer (Business Logic & Access Rules)"]
        Schemas["Schema Layer (Marshmallow / Validation)"]
        Models["Models Layer (User, Task, Category via SQLAlchemy ORM)"]

        AxiosClient -->|"HTTP / REST API (Port 5000)"| Gateway
        Gateway --> Routes
        Routes --> AuthGuard
        AuthGuard --> Services
        Services --> Schemas
        Services --> Models
    end

    subgraph Database ["Data Tier (Relational Storage)"]
        Driver["PyMySQL Connector"]
        MySQLDB[("MySQL Server 8.0.16+ (todo_db)")]

        Models --> Driver
        Driver --> MySQLDB
    end
```

### Request Flow Example: Creating a Task

1. **User Action**: The user submits the task creation form on the frontend. React Hook Form and Zod validate required fields locally.
2. **HTTP Dispatch**: Axios sends a `POST /api/tasks` request containing the task payload and the HTTP header `Authorization: Bearer <jwt_token>`.
3. **Authentication & Identity**: Flask's `jwt_required()` decorator intercepts the request, verifies the token signature and expiration, and extracts the caller's user ID via `uid()`.
4. **Validation**: `clean_task` validates payload attributes (non-empty title, valid status within `pending`/`in_progress`/`completed`, valid priority within `low`/`medium`/`high`).
5. **Role Check & Ownership Assignment**:
   - If the caller is an administrator and provides a valid `userId`, the backend verifies that the target user exists and sets `target_uid` to that user ID.
   - If the caller is a standard user, any supplied `userId` is ignored and `target_uid` remains the caller's ID.
6. **Persistence**: `task_service.create_task` resolves or creates the category, instantiates the `Task` model, persists the record using `db.session`, and commits the transaction.
7. **Response & Re-render**: The endpoint returns HTTP 201 Created with the serialized task object in camelCase formatting. TanStack Query invalidates the tasks cache and updates the UI automatically.

---

## 4. Project Structure

```text
to-do-application-grp18/
├── README.md                      # Root project overview and operational guide
├── .gitignore                     # Repository-wide ignore rules (secrets, venv, node_modules)
├── Backend/                       # Flask application source, configuration, and tests
│   ├── main.py                    # Server entry point (starts server on port 5000)
│   ├── requirements.txt           # Python package dependencies
│   ├── .env.example               # Template for backend environment variables
│   ├── README.md                  # Backend API documentation and route manual
│   ├── test_api.py                # Standalone verification script using in-memory SQLite
│   ├── app/                       # Application package
│   │   ├── __init__.py            # Application factory, CORS, JWTManager, and blueprints
│   │   ├── database.py            # SQLAlchemy setup and automatic initial admin account creation
│   │   ├── models/                # SQLAlchemy database models
│   │   │   ├── user.py            # User model with role and password hash
│   │   │   └── task.py            # Task and Category models with relationships
│   │   ├── routes/                # Flask blueprints
│   │   │   ├── auth.py            # Authentication routes (/api/auth)
│   │   │   ├── tasks.py           # Task CRUD and toggle routes (/api/tasks)
│   │   │   ├── admin.py           # Administrative monitoring routes (/api/admin)
│   │   │   ├── dashboard.py       # User metrics route (/api/dashboard)
│   │   │   └── helpers.py         # Auth decorators and utility helpers
│   │   ├── schemas/               # Request validation and serialization schemas
│   │   │   ├── auth_schema.py     # Auth payload validators
│   │   │   └── task_schema.py     # Task payload sanitizers and validators
│   │   └── services/              # Business logic isolation layer
│   │       ├── auth_service.py    # Authentication, registration, and token revocation
│   │       ├── task_service.py    # Task persistence, filtering, sorting, and deletion
│   │       ├── admin_service.py   # User management and team progress aggregations
│   │       └── dashboard_service.py # Personal task metrics calculations
│   └── tests/                     # Automated backend test suite
│       ├── conftest.py            # Pytest configuration, throwaway SQLite DB, and fixtures
│       ├── test_admin.py          # Admin route security and team metrics tests (5 tests)
│       ├── test_auth.py           # Registration, login, and JWT revocation tests (11 tests)
│       ├── test_database_persistence.py # Multi-request persistence and row deletion tests (2 tests)
│       ├── test_isolation.py      # Cross-tenant data isolation tests (3 tests)
│       ├── test_regression.py     # Bug fix verification tests for admin operations (2 tests)
│       ├── test_tasks.py          # Task CRUD, filters, search, and sort tests (10 tests)
│       └── run_tests.md           # Backend test execution instructions
├── database/                      # Relational database schemas, migrations, and tests
│   ├── schema.sql                 # Primary DDL script defining tables, keys, and constraints
│   ├── seed.sql                   # Deterministic sample data for testing
│   ├── queries.sql                # Parameterized queries for application workflows
│   ├── er-diagram.md              # Mermaid Entity-Relationship specification
│   ├── er-diagram.png             # Visual export of the Entity-Relationship diagram
│   ├── README.md                  # Database documentation, data dictionary, and operational guide
│   ├── .env.example               # Reference template for database connection parameters
│   ├── migrations/                # Forward schema migrations
│   │   └── 001_add_user_role.sql  # Migration script to add user role column to existing DBs
│   └── tests/                     # Automated database schema verification suite
│       ├── verify_schema.sql      # Transactional schema test suite (23 checks with rollback)
│       └── run_tests.md           # Database test execution instructions
└── Frontend/                      # React single-page application source and configuration
    ├── package.json               # Node.js dependencies and script definitions
    ├── vite.config.ts             # Vite configuration with Tailwind CSS v4 plugin
    ├── tsconfig.json              # TypeScript compiler configuration
    ├── .env.example               # Template for frontend environment variables
    ├── README.md                  # Frontend architecture, components, and state guide
    ├── index.html                 # HTML application shell
    └── src/                       # Application source code
        ├── main.tsx               # Application bootstrap and React DOM mounting
        ├── App.tsx                # App root provider wrapper and toast notifications
        ├── components/            # Reusable UI component library
        │   ├── dashboard/         # StatCard and ProductivityChart components
        │   ├── layout/            # AppLayout, Sidebar, and Header components
        │   ├── tasks/             # TaskItem, TaskCard, TaskForm, and TaskFilters
        │   └── ui/                # Base primitives (Button, Input, Card, Modal, Badge)
        ├── context/               # React Context providers (AuthContext.tsx)
        ├── hooks/                 # Custom TanStack Query hooks (useTasks, useDashboardStats)
        ├── lib/                   # API client configuration (api.ts) and utilities (utils.ts)
        ├── pages/                 # Route views (Dashboard, Tasks, Today, Upcoming, Profile, Admin)
        ├── routes/                # Application routes and route guards (AppRoutes, ProtectedRoute)
        ├── services/              # API dispatchers (authService.ts, taskService.ts, mock/)
        └── types/                 # TypeScript type and interface definitions
```

---

## 5. Prerequisites

Before installing the application, ensure your environment meets the following requirements:

1. **Python**: Version **3.10.0 or higher** (tested on Python 3.10.11).
   - Check version:
     ```bash
     python --version
     ```
2. **Node.js**: Version **18.0.0 or higher** (tested on Node.js v22.18.0) and **npm** (tested on npm 11.6.3).
   - Check version:
     ```bash
     node --version
     npm --version
     ```
3. **MySQL Server**: Version **8.0.16 or higher** (tested on MySQL 8.0.44).
   - *Requirement Reason*: MySQL versions prior to 8.0.16 parse `CHECK` constraints syntactically but do not enforce them. Version 8.0.16+ is mandatory to strictly enforce allowed values for user roles (`user`, `admin`), task statuses (`pending`, `in_progress`, `completed`), and priorities (`low`, `medium`, `high`).
   - Check version:
     ```bash
     mysql --version
     ```
4. **Git**: Installed and available in PATH (tested on Git 2.49.0). On Windows, use **Git Bash** for running the setup commands.

---

## 6. Getting Started

Follow these step-by-step instructions to set up and run the application from a fresh clone.

### Step 1: Clone the Repository
Open Git Bash (Windows) or Terminal (macOS/Linux):

```bash
git clone https://github.com/prem-03829/to-do-application-grp18.git
cd to-do-application-grp18
```

### Step 2: Database Setup
1. Ensure your MySQL server is running:
   - **Windows**: `net start MySQL80` (or verify in Windows Services)
   - **macOS / Linux**: `sudo systemctl start mysql` (or `brew services start mysql`)
2. Log into the MySQL CLI and initialize the database and application user:
   ```sql
   CREATE DATABASE todo_db;
   CREATE USER 'todo_user'@'localhost' IDENTIFIED BY 'your_secure_password';
   GRANT ALL PRIVILEGES ON todo_db.* TO 'todo_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
3. Execute the schema DDL from the project root:
   - **Git Bash / Linux / macOS**:
     ```bash
     mysql -u todo_user -p todo_db < database/schema.sql
     ```
   - **Windows PowerShell**:
     ```powershell
     Get-Content database/schema.sql | mysql -u todo_user -p todo_db
     ```
4. *(Optional)* Apply seed data for demonstration:
   ```bash
   mysql -u todo_user -p todo_db < database/seed.sql
   ```

> **Note on Migrations**: `database/schema.sql` is designed for fresh installations. If updating an existing database that was created without the `role` column, run `database/migrations/001_add_user_role.sql` instead. See [database/README.md](file:///database/README.md) for full database documentation.

### Step 3: Backend Setup
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Create and activate a Python virtual environment:
   - **Git Bash (Windows)**:
     ```bash
     python -m venv .venv
     source .venv/Scripts/activate
     ```
   - **Windows PowerShell**:
     ```powershell
     python -m venv .venv
     .\.venv\Scripts\Activate.ps1
     ```
   - **macOS / Linux**:
     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```
3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
5. Edit `Backend/.env` with your actual configuration:

   | Variable | Description | Example Value |
   |---|---|---|
   | `DATABASE_URL` | SQLAlchemy MySQL connection string. If omitted, falls back to local SQLite (`sqlite:///todo.db`). | `mysql+pymysql://todo_user:your_secure_password@localhost:3306/todo_db` |
   | `JWT_SECRET_KEY` | Secret key used to sign JWT tokens. Must be long and random. | `generate_using_python_command_below` |
   | `ADMIN_EMAIL` | Email for the auto-seeded administrator account. | `admin@college.edu` |
   | `ADMIN_PASSWORD` | Password for the auto-seeded administrator account. | `Admin@123` |

   To generate a secure 32-character random string for `JWT_SECRET_KEY`, run:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

6. Start the Flask backend server:
   ```bash
   python main.py
   ```
   The backend starts at `http://localhost:5000` with API endpoints accessible at `http://localhost:5000/api`.

### Step 4: Frontend Setup
1. Open a **new terminal window** and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables for the frontend:
   ```bash
   cp .env.example .env.local
   ```
4. Verify `Frontend/.env.local` contains the following settings to connect to the real Flask API:
   ```ini
   VITE_USE_MOCK_API=false
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

   | Variable | Description | Default |
   |---|---|---|
   | `VITE_USE_MOCK_API` | Set to `false` to communicate with the real Flask backend. When `true`, runs in mock mode using browser `localStorage`. | `false` |
   | `VITE_API_BASE_URL` | Base URL of the backend Flask API. | `http://localhost:5000/api` |

5. Start the frontend development server:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:5173`.

### Step 5: First Login and Account Setup
- **Administrator Login**: When the backend starts for the first time, it automatically creates the administrator account specified in `Backend/.env` (`admin@college.edu` / `Admin@123`). Log in with these credentials to access the administrative Team Hub.
- **Standard User Registration**: Register new user accounts through the registration page at `http://localhost:5173/register`. Public registration always assigns the `user` role; client-side attempts to specify an admin role are ignored by the backend.
- **Promoting a User to Admin**: If you need to grant administrator privileges to an existing user, execute an SQL update directly in MySQL:
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
  ```

---

### Quick Start in 5 Commands

```bash
# 1. Database: Initialize database schema (run from repo root)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS todo_db;" && mysql -u root -p todo_db < database/schema.sql

# 2. Backend: Set up virtual environment and install dependencies
cd Backend && python -m venv .venv && source .venv/Scripts/activate && pip install -r requirements.txt

# 3. Backend: Configure environment and start server (Terminal 1)
cp .env.example .env && python main.py

# 4. Frontend: Install dependencies and configure real API mode (Terminal 2)
cd ../Frontend && npm install && echo "VITE_USE_MOCK_API=false" > .env.local

# 5. Frontend: Start development server
npm run dev
```

---

## 7. Using the Application

### Standard User Walkthrough
1. **Sign In**: Navigate to `http://localhost:5173/login`. Log in using registered user credentials or click Register to create a new account.
2. **Dashboard Overview**: After login, the Dashboard (`/`) presents dynamic metrics cards (Total Tasks, In Progress, Pending, Completed, and Completion Rate) and a Recharts completion visualization.
3. **Create a Task**: Click the "+ New Task" button in the header or sidebar. In the modal, provide a task title, description, priority (Low, Medium, High), due date, and optional category (e.g., "Work", "Personal"). Click "Create Task".
4. **Manage Tasks**: Open the "Tasks" page (`/tasks`) to view all owned tasks. Use the search input to filter by keyword, toggle priority or status filters, and switch between list and grid view.
5. **Update and Toggle Tasks**: Click the checkbox on any task card to instantly toggle its status between `pending` and `completed`. Click a task to open the detail view and edit its details.
6. **Date-Specific Views**:
   - Access **Today** (`/today`) to focus on tasks due today with a visual progress bar.
   - Access **Upcoming** (`/upcoming`) to plan for future scheduled deadlines.
   - Access **Completed** (`/completed`) to inspect completed items or reopen them.
7. **Profile**: Navigate to `/profile` to view account details and select an animated avatar character.

### Administrator Walkthrough
1. **Sign In**: Log in using the admin account (`admin@college.edu` / `Admin@123`).
2. **Team Hub Navigation**: In the sidebar, select the **Team Hub** (`/admin`) link (visible only to administrators).
3. **Monitor Team Progress**:
   - Review high-level metrics cards: Total Team Members, Active Working Tasks, Total Assigned Tasks, and Completed Tasks.
   - Browse the team members list. Each card displays the member's email, task volume, completion rate, and progress bar.
   - Click the expansion arrow on any member's card to reveal their complete task list.
4. **Assign a Task to a User**:
   - Click the "+ New Task" button.
   - As an administrator, an additional "Assign To User" dropdown is visible.
   - Select the target user from the dropdown, fill out the task details, and submit. The task is created and assigned to the selected user's account.
5. **Inspect Individual Tasks**: Click any user's task to view its detailed parameters.

---

## 8. API Reference

All application endpoints are served under the `/api` prefix. Protected endpoints require the `Authorization: Bearer <token>` header.

### Endpoints Table

| Method | Path | Auth Required | Role Required | Purpose |
|---|---|---|---|---|
| `POST` | `/api/auth/register` | No | None | Register a new user account (creates role `'user'`) |
| `POST` | `/api/auth/login` | No | None | Authenticate user and obtain a JWT access token |
| `GET` | `/api/auth/me` | Yes | Any | Retrieve authenticated user profile |
| `POST` | `/api/auth/logout` | Yes | Any | Revoke the current JWT access token |
| `GET` | `/api/tasks` | Yes | Any | List own tasks (filters: `q`, `status`, `priority`, `category`, `sort`) |
| `POST` | `/api/tasks` | Yes | Any | Create a new task (admins can pass `userId` to assign to another user) |
| `GET` | `/api/tasks/<id>` | Yes | Any / Admin | Get task details by ID (user can get own; admin can get any task) |
| `PUT` | `/api/tasks/<id>` | Yes | Owner Only | Update task fields (title, description, status, priority, dueDate, category) |
| `PATCH` | `/api/tasks/<id>` | Yes | Owner Only | Partial update of task fields |
| `PATCH` | `/api/tasks/<id>/toggle` | Yes | Owner Only | Toggle task status between `pending` and `completed` |
| `DELETE` | `/api/tasks/<id>` | Yes | Owner Only | Permanently delete a task (returns HTTP 204) |
| `GET` | `/api/dashboard/stats` | Yes | Any | Get dashboard metrics and task counts for the authenticated user |
| `GET` | `/api/admin/users` | Yes | Admin Only | List all registered users with task counts and completion rates |
| `GET` | `/api/admin/users/<id>/tasks` | Yes | Admin Only | List tasks belonging to a specific user (`?status=` filter supported) |
| `GET` | `/api/admin/tasks` | Yes | Admin Only | List all tasks with owner details (`?status=`, `?userId=`, `?q=`) |
| `GET` | `/api/admin/team-progress` | Yes | Admin Only | Retrieve team progress data for admin dashboard cards |
| `GET` | `/api/admin/stats` | Yes | Admin Only | Retrieve overall and per-user progress statistics |

### Request and Response Examples

#### 1. User Login
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "your_password"
  }
  ```
- **Response** (`200 OK`):
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "Alice Smith",
      "email": "user@example.com",
      "role": "user"
    }
  }
  ```

#### 2. Create Task
- **Endpoint**: `POST /api/tasks`
- **Request Body**:
  ```json
  {
    "title": "Complete final internship report",
    "description": "Prepare architecture diagram and submission notes",
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2026-12-01",
    "category": "Documentation"
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "id": 10,
    "title": "Complete final internship report",
    "description": "Prepare architecture diagram and submission notes",
    "status": "in_progress",
    "priority": "high",
    "dueDate": "2026-12-01",
    "category": "Documentation",
    "userId": 1,
    "createdAt": "2026-11-22T10:00:00"
  }
  ```

### Error Response Format and Status Codes

The API returns standard JSON error responses:
```json
{
  "error": "Error description message"
}
```

Standard HTTP status codes utilized:
- `200 OK`: Successful operation.
- `201 Created`: Resource created successfully.
- `204 No Content`: Resource deleted successfully.
- `400 Bad Request`: Input validation failure (e.g., empty title, invalid status/priority, malformed email).
- `401 Unauthorized`: Missing, invalid, expired, or revoked JWT token.
- `403 Forbidden`: Insufficient privileges (e.g., standard user requesting an admin endpoint).
- `404 Not Found`: Requested task or user does not exist.
- `409 Conflict`: Duplicate resource creation (e.g., registration with an email already taken).

---

## 9. Database

The database architecture is designed in Third Normal Form (3NF) across three normalized tables: `users`, `categories`, and `tasks`.

### Entity-Relationship Diagram

```mermaid
erDiagram
    users ||--o{ categories : "creates (1:N, ON DELETE CASCADE)"
    users ||--o{ tasks : "owns (1:N, ON DELETE CASCADE)"
    categories ||--o{ tasks : "categorizes (1:N, ON DELETE SET NULL)"

    users {
        int id PK "AUTO_INCREMENT"
        varchar_100 name "NOT NULL"
        varchar_255 email "NOT NULL, UNIQUE"
        varchar_255 password_hash "NOT NULL"
        varchar_10 role "NOT NULL, DEFAULT 'user'"
    }

    categories {
        int id PK "AUTO_INCREMENT"
        int user_id FK "NOT NULL -> users.id"
        varchar_100 name "NOT NULL, UNIQUE(user_id, name)"
    }

    tasks {
        int id PK "AUTO_INCREMENT"
        int user_id FK "NOT NULL -> users.id"
        int category_id FK "NULL -> categories.id"
        varchar_200 title "NOT NULL"
        text description "NULL"
        varchar_20 status "NOT NULL, DEFAULT 'pending'"
        varchar_10 priority "NOT NULL, DEFAULT 'medium'"
        date due_date "NULL"
        datetime created_at "NOT NULL, DEFAULT CURRENT_TIMESTAMP"
    }
```

### Table Relationships & Key Constraints
- **`users` Table**: Primary storage for user credentials. Enforces unique email addresses (`UNIQUE(email)`) and role validation (`CHECK (role IN ('user', 'admin'))`).
- **`categories` Table**: Organizes tasks per user. Enforces scoped uniqueness (`UNIQUE(user_id, name)`), allowing different users to share common category names without collision. Deleting a user cascades to remove their categories (`ON DELETE CASCADE`).
- **`tasks` Table**: Stores tasks linked to `users.id` (`ON DELETE CASCADE`) and optionally to `categories.id` (`ON DELETE SET NULL`). Enforces valid statuses (`CHECK (status IN ('pending', 'in_progress', 'completed'))`) and priorities (`CHECK (priority IN ('low', 'medium', 'high'))`).
- **Indexes**: Dedicated B-Tree indexes on `tasks(user_id)`, `tasks(user_id, status)`, and `tasks(due_date)` ensure fast filtering and sorting.

For the full data dictionary, reference queries, backup procedures, and schema verification, see [database/README.md](file:///database/README.md).

---

## 10. Testing

The project maintains two independent automated test suites: the Database Schema Verification Suite and the Backend Test Suite.

### 1. Database Schema Verification Suite (`database/tests/`)
- **Scope**: 23 automated structural and integrity checks verifying MySQL version compliance, table existence, column specifications, foreign key cascade/nullify rules, check constraints, default values, and index usage.
- **Zero Test Data Guarantee**: The test suite runs entirely inside a transaction and issues an explicit `ROLLBACK` upon completion. No test rows remain in your database.
- **Run Command (Windows PowerShell)**:
  ```powershell
  Get-Content database/tests/verify_schema.sql | mysql -u todo_user -p todo_db
  ```
- **Run Command (macOS / Linux)**:
  ```bash
  mysql -u todo_user -p todo_db < database/tests/verify_schema.sql
  ```
- **Expected Result**: `total_tests: 23 | passed: 23 | failed: 0 | warnings: 0`.
- Detailed documentation: [database/tests/run_tests.md](file:///database/tests/run_tests.md).

### 2. Backend Automated Test Suite (`Backend/tests/`)
- **Scope**: 33 automated tests across 6 modules covering administrative access control, authentication, database persistence, multi-tenant isolation, regression fixes, and task CRUD operations.
- **Zero MySQL Impact Guarantee**: The test harness (`conftest.py`) initializes a temporary SQLite database using `tempfile.NamedTemporaryFile` and resets tables between tests. It never connects to or modifies the real MySQL database (`todo_db`).
- **Run Command (Windows PowerShell)**:
  ```powershell
  Backend\.venv\Scripts\pytest.exe -v Backend\tests
  ```
- **Run Command (macOS / Linux)**:
  ```bash
  Backend/.venv/bin/pytest -v Backend/tests
  ```
- **Expected Result**: `33 passed in ~11s`.
- Detailed documentation: [Backend/tests/run_tests.md](file:///Backend/tests/run_tests.md).

### 3. Standalone Backend Check Script
A lightweight standalone script is also provided for quick sanity checks:
```bash
python Backend/test_api.py
```

*(Note: Frontend unit and end-to-end browser test suites do not currently exist in the repository; prior prototypes were removed to maintain build stability).*

---

## 11. Security Notes

- **Password Hashing**: Passwords are never stored in plaintext. Passwords are securely hashed using Werkzeug's `generate_password_hash` implementation (PBKDF2 with SHA-256) prior to database persistence.
- **JWT Authorization**: Authenticated sessions are secured using JSON Web Tokens signed with `JWT_SECRET_KEY` and configured with a 2-hour expiration window (`JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=2)`).
- **Token Revocation (Logout)**: Logging out adds the token's unique identifier (`jti`) to an in-memory revocation blocklist. Subsequent requests using a revoked token are rejected with `401 Unauthorized`.
- **Backend Role Enforcement**: Administrative access is protected at the route level via the `@admin_only` decorator. Client-side route protections exist solely for user navigation; all security boundaries are validated by the backend.
- **Data Isolation**: User identities are extracted directly from validated JWT claims (`uid()`). Update and delete operations strictly verify ownership (`Task.user_id == uid()`), preventing cross-tenant access.
- **Environment Separation**: Sensitive credentials and encryption keys are loaded via `.env` files and excluded from version control via `.gitignore`.
- **Demo Credentials**: The default credentials (`admin@college.edu` / `Admin@123`) are provided exclusively for local demonstration and development evaluation. They must be changed in `.env` for any live deployment.
- **Production Server**: The Flask development server (`python main.py`) is designed for local development only. Production deployments require a production-grade WSGI server (such as Gunicorn or uWSGI) deployed behind a reverse proxy (such as Nginx).

---

## 12. Troubleshooting

| Symptom | Probable Cause | Fix / Solution |
|---|---|---|
| `Access denied for user ... (using password: YES)` | `DATABASE_URL` in `Backend/.env` contains placeholder credentials (e.g., `USER:PASSWORD`). | Edit `Backend/.env` and replace placeholders with your actual MySQL username and password. |
| `Can't connect to MySQL server on 'localhost'` | MySQL server service is stopped or not listening on port 3306. | Start the MySQL service: `net start MySQL80` on Windows, or `sudo systemctl start mysql` on Linux. |
| `Failed to open file 'database/schema.sql'` | The command was executed from an incorrect working directory. | Ensure your shell is in the repository root directory (`to-do-application-grp18`) before executing the command. |
| `mysql: command not found` | The MySQL client binary directory is not registered in the system `PATH`. | Add the MySQL bin directory (e.g., `C:\Program Files\MySQL\MySQL Server 8.0\bin`) to your system environment `PATH` variable. |
| Admin cannot log in with `.env` credentials | The admin account is seeded only once when the database is first initialized. Subsequent changes to `.env` do not update the database row. | Update the admin password directly in MySQL using `UPDATE users SET password_hash = ...` or re-execute `database/schema.sql` on a fresh database. |
| `Address already in use` (Port 5000 or 5173) | A previous server instance or another process is occupying port 5000 or 5173. | Identify and terminate the blocking process: on Windows run `netstat -ano \| findstr :5000` followed by `taskkill /PID <PID> /F`. |
| Frontend cannot reach backend (`ERR_CONNECTION_REFUSED`) | Flask server is not running, or `VITE_API_BASE_URL` in `Frontend/.env.local` is misconfigured. | Verify the backend is running (`python main.py`) and ensure `VITE_API_BASE_URL=http://localhost:5000/api` is set in `Frontend/.env.local`. |
| `pip install` fails on `cryptography` or `PyMySQL` | Outdated Python version or missing compilation tools. | Ensure you are running Python 3.10+ and upgrade pip: `python -m pip install --upgrade pip`. |

---

## 13. Git Workflow and Branches

### Branch Architecture
The repository uses a multi-branch development model:
- **`main`**: Production-ready, stable codebase.
- **`develop`**: Central integration branch where feature branches are merged and verified.
- **`backend`**: Backend development branch (Flask API, SQLAlchemy models, JWT auth).
- **`db`**: Database development branch (schemas, seed data, reference queries, schema tests).

### Merge Order & Integration Workflow
1. Database schema updates are finalized on the `db` branch and validated using `verify_schema.sql`.
2. Backend models and endpoints are implemented on the `backend` branch to match the database schema.
3. Feature branches are merged into `develop` for integration testing between frontend, backend, and database tiers.
4. After end-to-end verification, `develop` is merged into `main`.

### Commit Message Conventions
The repository follows the Conventional Commits specification:
- `feat: ...` or `feat(scope): ...` for new capabilities (e.g., `feat: enhance task management with admin role checks`).
- `fix: ...` or `fix(scope): ...` for bug resolutions (e.g., `fix: align frontend and backend with database schema`).
- `docs: ...` for documentation additions or corrections (e.g., `docs: add MySQL setup steps`).
- `test(scope): ...` for test suite additions (e.g., `test(backend): add comprehensive test suite`).
- `chore: ...` for maintenance and configuration tasks.

---

## 14. Team and Media

### Project Contributors (Group 18)

| Name | Role | Core Responsibilities |
|---|---|---|
| [Name] | Database Architecture & Testing | Schema DDL design, 3NF normalization, constraint definitions, migration scripts, and SQL verification suite |
| [Name] | Backend Engineering & Security | Flask REST API, SQLAlchemy models, JWT authentication, role-based access control, and backend test suite |
| [Name] | Frontend Architecture & UI/UX | React component development, Tailwind CSS styling, Recharts integration, and TanStack Query state caching |
| [Name] | Integration & Quality Assurance | Full-stack integration, bug fixing, test harness verification, and technical documentation |

### Application Screenshots

Visual previews of the application interface will be placed in `docs/screenshots/`:
- `docs/screenshots/01_dashboard.png`: Personal Productivity Dashboard with dynamic statistics cards and completion analytics.
- `docs/screenshots/02_task_list.png`: Unified Task Management page with search, priority filtering, and status controls.
- `docs/screenshots/03_task_modal.png`: Task creation and editing modal dialog.
- `docs/screenshots/04_admin_team_hub.png`: Administrator Team Progress Hub showing team member cards and task progress bars.
- `docs/screenshots/05_user_profile.png`: User Profile page with animated avatar selection and connection status.

---

## 15. Known Limitations and Possible Improvements

Based on code audits of the active codebase, the following items represent current architecture decisions, limitations, and future enhancement paths:

1. **Client-Side Profile Avatar and Department Storage**: The `ProfilePage` supports selecting animated SVG avatar presets and entering department names, but these attributes are currently persisted exclusively in browser `localStorage` and React `AuthContext`. The backend `User` model currently stores `id`, `name`, `email`, `password_hash`, and `role`. *Improvement*: Add `avatar_url` and `department` columns to the database schema, update the `User` model, and provide a `PUT /api/auth/profile` endpoint.
2. **Admin Task Modification Boundaries**: While administrators can view any user's task details via `GET /api/tasks/<id>` and assign new tasks to team members, administrators cannot update (`PUT /api/tasks/<id>`), toggle (`PATCH /api/tasks/<id>/toggle`), or delete (`DELETE /api/tasks/<id>`) tasks owned by other users because the backend routes enforce `Task.user_id == uid()`. *Improvement*: Introduce role-aware permission checks in update and delete routes if administrative modification of team member tasks is desired.
3. **In-Memory Token Revocation**: Revoked JWT identifiers (`jti`) are tracked in memory using a Python `set` in `auth_service.py`. Restarting the Flask process clears the blocklist. *Improvement*: Store revoked tokens in a Redis instance or a dedicated database table (`revoked_tokens`) for persistent token invalidation across server restarts.
4. **Standalone Category Management**: Categories are automatically created on the fly when tasks specify a category name, and tasks are unlinked when a category is cleared. There are currently no standalone category management endpoints (such as `GET /api/categories` or `DELETE /api/categories/<id>`). *Improvement*: Implement dedicated category endpoints for custom color assignments and pre-defined category lists.
5. **Frontend Mock Mode Default**: `Frontend/.env.example` ships with `VITE_USE_MOCK_API=true` by default. Developers connecting to the real backend must ensure `VITE_USE_MOCK_API=false` is configured in `Frontend/.env.local`.
6. **Administrator Account Provisioning**: Initial administrator accounts are provisioned via backend startup configuration (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). There is currently no web interface for admins to promote standard users; user role escalation currently requires direct database modification (`UPDATE users SET role = 'admin' WHERE email = ...`).
