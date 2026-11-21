# Running Backend Automated Tests

This guide provides instructions for executing the automated backend test suite (`Backend/tests/`) across Windows, macOS, and Linux environments.

---

## 1. Prerequisites

1. **Python 3.10 or higher** installed.
   - Verify version:
     ```bash
     python --version
     ```
2. **Virtual environment and dependencies installed**:
   - The backend virtual environment must have all dependencies installed from `Backend/requirements.txt`:
     ```bash
     pip install -r Backend/requirements.txt
     ```
3. **Zero database setup required**:
   - The test suite uses an isolated, throwaway SQLite database (`tempfile.NamedTemporaryFile`) configured in `Backend/tests/conftest.py`. It never connects to or modifies the persistent MySQL database (`todo_db`) and does not read or expose secrets from `Backend/.env`.

---

## 2. Windows (PowerShell) Commands

Run the commands from the repository root (`to-do-application-grp18`):

### Option A: Using the Virtual Environment Directly (Recommended)

```powershell
# Run the complete test suite with verbose output
Backend\.venv\Scripts\pytest.exe -v Backend\tests
```

### Option B: Activating the Virtual Environment

```powershell
# Activate the virtual environment
.\Backend\.venv\Scripts\Activate.ps1

# Execute tests
pytest -v Backend/tests

# Deactivate when finished
deactivate
```

### Running Specific Test Modules

```powershell
# Run a single test module (e.g., authentication tests)
Backend\.venv\Scripts\pytest.exe -v Backend\tests\test_auth.py

# Run a specific test function
Backend\.venv\Scripts\pytest.exe -v Backend\tests\test_tasks.py::test_create_task_full
```

---

## 3. macOS and Linux (Bash / Zsh) Commands

Run the commands from the repository root (`to-do-application-grp18`):

### Option A: Using the Virtual Environment Directly

```bash
# Run the complete test suite with verbose output
Backend/.venv/bin/pytest -v Backend/tests
```

### Option B: Activating the Virtual Environment

```bash
# Activate the virtual environment
source Backend/.venv/bin/activate

# Execute tests
pytest -v Backend/tests

# Deactivate when finished
deactivate
```

### Running Specific Test Modules

```bash
# Run a single test module (e.g., authentication tests)
Backend/.venv/bin/pytest -v Backend/tests/test_auth.py

# Run a specific test function
Backend/.venv/bin/pytest -v Backend/tests/test_tasks.py::test_create_task_full
```

---

## 4. How to Read the Output

The test suite runs with verbose output (`-v`), reporting individual test execution across all 6 test modules:

### Result Set 1: Individual Test Breakdown

A breakdown of all 33 tests across the 6 test modules:

| # | Test Name | Status | Details |
|---|---|---|---|
| 1 | `test_admin.py::test_admin_endpoints_blocked_for_normal_users` | PASS | Non-admin receives 403 Forbidden on all `/api/admin/*` endpoints |
| 2 | `test_admin.py::test_admin_endpoints_require_token` | PASS | Unauthenticated requests to admin routes return 401 Unauthorized |
| 3 | `test_admin.py::test_admin_view_all_users_and_tasks` | PASS | Admin retrieves all standard users with task counts and completion rates |
| 4 | `test_admin.py::test_admin_view_specific_user_tasks` | PASS | Admin retrieves tasks for a specific user ID with optional status filters |
| 5 | `test_admin.py::test_admin_team_progress_and_stats` | PASS | Admin views team progress metrics and system-wide task statistics |
| 6 | `test_auth.py::test_register_valid` | PASS | Valid user registration succeeds with 201 Created and default 'user' role |
| 7 | `test_auth.py::test_register_duplicate_email` | PASS | Duplicate email registration is rejected with 409 Conflict |
| 8 | `test_auth.py::test_register_short_password` | PASS | Password under 6 characters is rejected with 400 Bad Request |
| 9 | `test_auth.py::test_register_invalid_email` | PASS | Malformed email address is rejected with 400 Bad Request |
| 10 | `test_auth.py::test_register_ignores_client_role` | PASS | Client-supplied role (e.g., 'admin') is ignored; defaults to 'user' |
| 11 | `test_auth.py::test_login_success` | PASS | Valid credentials return 200 OK with JWT token and user profile |
| 12 | `test_auth.py::test_login_wrong_password` | PASS | Invalid password returns 401 Unauthorized |
| 13 | `test_auth.py::test_login_nonexistent_email` | PASS | Non-existent user email returns 401 Unauthorized |
| 14 | `test_auth.py::test_protected_endpoint_without_token` | PASS | Protected routes require Authorization header; returns 401 if missing |
| 15 | `test_auth.py::test_me_endpoint_with_token` | PASS | `/api/auth/me` returns identity of the currently authenticated user |
| 16 | `test_auth.py::test_logout_and_token_revocation` | PASS | Logout revokes token; subsequent requests with revoked token return 401 |
| 17 | `test_database_persistence.py::test_database_persistence_across_requests` | PASS | Created task persists across requests and verified directly in database |
| 18 | `test_database_persistence.py::test_deleting_task_removes_database_row` | PASS | Task deletion via API completely removes row from the database table |
| 19 | `test_isolation.py::test_user_b_cannot_access_user_a_task` | PASS | User B cannot view, update, toggle, or delete User A's task (404 Not Found) |
| 20 | `test_isolation.py::test_task_lists_are_strictly_isolated` | PASS | User task list queries return strictly user-owned tasks with zero leakage |
| 21 | `test_isolation.py::test_non_admin_cannot_assign_task_to_other_user` | PASS | Normal user passing another user's ID still saves task under caller |
| 22 | `test_regression.py::test_regression_admin_assigns_task_to_user_x` | PASS | Admin task creation with `userId` correctly assigns task to User X |
| 23 | `test_regression.py::test_regression_admin_can_open_user_task` | PASS | Admin can open any user's task by ID (200 OK), while standard user cannot |
| 24 | `test_tasks.py::test_create_task_full` | PASS | Task creation with all fields (title, description, status, priority, due date, category) |
| 25 | `test_tasks.py::test_create_task_title_only` | PASS | Minimal task creation applies default status ('pending') and priority ('medium') |
| 26 | `test_tasks.py::test_create_task_empty_title_rejected` | PASS | Empty or whitespace-only task title is rejected with 400 Bad Request |
| 27 | `test_tasks.py::test_create_task_invalid_status_priority` | PASS | Unrecognized status or priority values are rejected with 400 Bad Request |
| 28 | `test_tasks.py::test_list_tasks` | PASS | Listing tasks returns all tasks belonging to the authenticated user |
| 29 | `test_tasks.py::test_filter_tasks_by_status` | PASS | Filtering tasks by query parameter (`?status=pending|in_progress|completed`) |
| 30 | `test_tasks.py::test_search_tasks_by_query` | PASS | Substring search across task titles using query parameter (`?q=keyword`) |
| 31 | `test_tasks.py::test_sort_tasks` | PASS | Task sorting by title in ascending (`?sort=title:asc`) and descending order |
| 32 | `test_tasks.py::test_get_update_toggle_delete_task` | PASS | Full task lifecycle: GET by ID, PUT update, PATCH toggle status, DELETE |
| 33 | `test_tasks.py::test_category_handling` | PASS | Category creation, filtering by category, and unlinking category |

#### Example Output:

```
============================= test session starts =============================
platform win32 -- Python 3.10.11, pytest-9.2.0, pluggy-1.7.0 -- Backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: to-do-application-grp18
collecting ... collected 33 items

Backend/tests/test_admin.py::test_admin_endpoints_blocked_for_normal_users PASSED [  3%]
Backend/tests/test_admin.py::test_admin_endpoints_require_token PASSED   [  6%]
Backend/tests/test_admin.py::test_admin_view_all_users_and_tasks PASSED  [  9%]
Backend/tests/test_admin.py::test_admin_view_specific_user_tasks PASSED  [ 12%]
Backend/tests/test_admin.py::test_admin_team_progress_and_stats PASSED   [ 15%]
Backend/tests/test_auth.py::test_register_valid PASSED                   [ 18%]
Backend/tests/test_auth.py::test_register_duplicate_email PASSED         [ 21%]
Backend/tests/test_auth.py::test_register_short_password PASSED          [ 24%]
Backend/tests/test_auth.py::test_register_invalid_email PASSED           [ 27%]
Backend/tests/test_auth.py::test_register_ignores_client_role PASSED     [ 30%]
Backend/tests/test_auth.py::test_login_success PASSED                    [ 33%]
Backend/tests/test_auth.py::test_login_wrong_password PASSED             [ 36%]
Backend/tests/test_auth.py::test_login_nonexistent_email PASSED          [ 39%]
Backend/tests/test_auth.py::test_protected_endpoint_without_token PASSED [ 42%]
Backend/tests/test_auth.py::test_me_endpoint_with_token PASSED           [ 45%]
Backend/tests/test_auth.py::test_logout_and_token_revocation PASSED      [ 48%]
Backend/tests/test_database_persistence.py::test_database_persistence_across_requests PASSED [ 51%]
Backend/tests/test_database_persistence.py::test_deleting_task_removes_database_row PASSED [ 54%]
Backend/tests/test_isolation.py::test_user_b_cannot_access_user_a_task PASSED [ 57%]
Backend/tests/test_isolation.py::test_task_lists_are_strictly_isolated PASSED [ 60%]
Backend/tests/test_isolation.py::test_non_admin_cannot_assign_task_to_other_user PASSED [ 63%]
Backend/tests/test_regression.py::test_regression_admin_assigns_task_to_user_x PASSED [ 66%]
Backend/tests/test_regression.py::test_regression_admin_can_open_user_task PASSED [ 69%]
Backend/tests/test_tasks.py::test_create_task_full PASSED                [ 72%]
Backend/tests/test_tasks.py::test_create_task_title_only PASSED          [ 75%]
Backend/tests/test_tasks.py::test_create_task_empty_title_rejected PASSED [ 78%]
Backend/tests/test_tasks.py::test_create_task_invalid_status_priority PASSED [ 81%]
Backend/tests/test_tasks.py::test_list_tasks PASSED                      [ 84%]
Backend/tests/test_tasks.py::test_filter_tasks_by_status PASSED          [ 87%]
Backend/tests/test_tasks.py::test_search_tasks_by_query PASSED           [ 90%]
Backend/tests/test_tasks.py::test_sort_tasks PASSED                      [ 93%]
Backend/tests/test_tasks.py::test_get_update_toggle_delete_task PASSED   [ 96%]
Backend/tests/test_tasks.py::test_category_handling PASSED               [100%]

============================= 33 passed in 11.01s =============================
```

### Result Set 2: Summary Counts

Provides the aggregate score:

```
+-------------+--------+--------+----------+
| total_tests | passed | failed | skipped  |
+-------------+--------+--------+----------+
|          33 |     33 |      0 |        0 |
+-------------+--------+--------+----------+
```

Target status: `failed: 0`, `skipped: 0`.

---

## 5. Test Suite Breakdown by Module

The backend test suite is structured into 6 focused test modules under `Backend/tests/`:

1. **`test_admin.py` (5 tests)**:
   - Validates role-based access control (RBAC).
   - Confirms non-admin users receive `403 Forbidden` and unauthenticated requests receive `401 Unauthorized`.
   - Tests admin endpoints: listing all users with task metrics (`/api/admin/users`), fetching user-specific tasks (`/api/admin/users/<id>/tasks`), and aggregate stats (`/api/admin/team-progress`, `/api/admin/stats`).

2. **`test_auth.py` (11 tests)**:
   - Validates user registration rules: duplicate email rejection (409), minimum 6-character password constraint (400), and email format check (400).
   - Verifies privilege escalation defense: registration ignores client-provided `role` and strictly creates standard `user` accounts.
   - Tests authentication lifecycle: successful login with JWT token issuance, invalid password rejection (401), non-existent email rejection (401), protected endpoint authentication requirement, `/api/auth/me` identity endpoint, and token revocation upon logout.

3. **`test_database_persistence.py` (2 tests)**:
   - Verifies data persistence across separate HTTP requests and queries the SQLite database directly through SQLAlchemy session.
   - Confirms hard deletion: deleting a task through the API completely deletes the underlying database row.

4. **`test_isolation.py` (3 tests)**:
   - Enforces strict tenant isolation: User B cannot retrieve, update, toggle, or delete User A's tasks (returning 404).
   - Verifies task list queries return only the authenticated user's tasks with zero cross-tenant leakage.
   - Confirms standard users cannot assign tasks to another user ID.

5. **`test_regression.py` (2 tests)**:
   - Verifies Bug 1 fix: When an administrator creates a task specifying `userId`, the task is properly assigned to the target user rather than the administrator.
   - Verifies Bug 2 fix: An administrator can retrieve any user's task by ID via `/api/tasks/<id>` without encountering a 404 error, while standard users remain restricted from accessing other users' tasks.

6. **`test_tasks.py` (10 tests)**:
   - Tests task creation with complete payloads as well as default value assignments (status defaults to `pending`, priority defaults to `medium`).
   - Validates input boundaries: empty or whitespace title rejection (400), invalid status or priority values rejection (400).
   - Tests task querying capabilities: listing user tasks, filtering by status (`?status=`), title substring search (`?q=`), and sorting by title (`?sort=title:asc` / `?sort=title:desc`).
   - Tests single task operations: retrieve by ID, update fields, toggle completion status, and deletion.
   - Tests category handling: automatic category creation, filtering tasks by category (`?category=`), and dissociating categories.

---

## 6. Zero Test Data & Database Isolation Guarantee

The test suite runs with complete database isolation to guarantee zero side-effects:

1. **Throwaway SQLite Database**: In `Backend/tests/conftest.py`, a temporary database file is created via Python's standard `tempfile.NamedTemporaryFile(suffix=".db", delete=False)`.
2. **Environment Override**: The `DATABASE_URL` environment variable is explicitly set to the temporary SQLite file before the Flask application is initialized. The persistent MySQL database (`todo_db`) is never contacted.
3. **No Secret Leakage**: Test credentials (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET_KEY`) are assigned synthetic mock values in memory; `Backend/.env` is never loaded or exposed.
4. **Per-Test Table Cleanup**: The `clean_db` autouse fixture automatically clears tasks, categories, and non-admin users between individual test cases, ensuring complete test independence.
5. **Automatic Teardown**: After the test session completes, SQLAlchemy engine connections are disposed and the temporary SQLite database file is permanently removed from disk.
