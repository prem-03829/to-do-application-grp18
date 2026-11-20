# To-Do App Backend (Flask + MySQL)

API for the to-do app: user login, task CRUD, and an admin role.

## Project Structure
```text
Backend/
├── main.py          # App entry point only
└── app/
    ├── __init__.py  # App factory, CORS, JWT, and Blueprint registration
    ├── database.py  # MySQL database connection and setup
    ├── models/      # Database models (User, Category, Task)
    ├── schemas/     # Request/response validation & serialization
    ├── services/    # Business logic separated from routes
    └── routes/      # Flask Blueprints (auth.py, tasks.py, admin.py, dashboard.py)
```

## Run it
1. `cd Backend`
2. `python -m venv venv`, then activate it (Windows PowerShell: `venv\Scripts\activate`)
3. `pip install -r requirements.txt`
4. Copy `.env.example` to `.env` and set `DATABASE_URL` (MySQL). Without `.env` it uses a local SQLite file, so you can run it right away.
5. `python main.py` -> API at http://localhost:5000/api (the frontend expects this address)
6. `python test_api.py` -> runs all checks

Frontend: in `Frontend/.env` set `VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL=http://localhost:5000/api`.

## Database
Works with the tables in `database/schema.sql` (users, categories, tasks). The backend adds a `role`
column to `users` by itself if it is missing, and creates tables that do not exist yet.

### Setup with MySQL
1. Install MySQL 8.0.16+ and run `database/schema.sql` from the `db` branch (creates `todo_db`).
2. Copy `.env.example` to `.env` and set `DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/todo_db`
3. Run `pip install -r requirements.txt`, then `python main.py`
4. Admin login is set in `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`

## Login and roles
- Send the token as `Authorization: Bearer <token>`.
- Two roles: `user` and `admin`. Login returns `{ token, user: { id, name, email, role } }`.
- Register always creates a normal user. One admin is created automatically:
  `admin@college.edu` / `Admin@123` (change with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`).

## Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | `{name,email,password}` -> 201 |
| POST | /api/auth/login | `{email,password}` -> `{token,user}` |
| GET | /api/auth/me | current user |
| POST | /api/auth/logout | revoke token |
| GET | /api/tasks?q=&status=&priority=&category=&sort=field:order | own tasks |
| POST | /api/tasks | `{title,description,priority,status,dueDate,category}` -> 201 |
| GET | /api/tasks/<id> | one task |
| PUT/PATCH | /api/tasks/<id> | edit task |
| PATCH | /api/tasks/<id>/toggle | pending <-> completed |
| DELETE | /api/tasks/<id> | -> 204 |
| GET | /api/dashboard/stats | own task counts |

Status: `pending`, `in_progress`, `completed`. Priority: `low`, `medium`, `high`.

### Admin (admin token only, others get 403)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/admin/users | all users + task counts and completion % |
| GET | /api/admin/users/<id>/tasks?status= | tasks of one user |
| GET | /api/admin/tasks?status=&userId=&q= | all tasks with owner name and email |
| GET | /api/admin/team-progress | per user: tasks in progress, other tasks, counts, completion % (used by the admin page) |
| GET | /api/admin/stats | overall progress + progress per user |
