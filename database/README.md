# Database Documentation: To-Do Application (todo_db)

This directory contains the database architecture, Data Definition Language (DDL) schemas, schema migration scripts, deterministic seed data, optimized reference queries, automated schema verification tests, and Entity-Relationship (ER) models for the full-stack To-Do application. It serves as the single source of truth for the database tier while backend models and frontend client interfaces are being developed.

Status: Schema complete, 23/23 verification tests passing, MySQL 8.0.44 tested.

---

## 2. Features

- Three normalized tables: `users`, `categories`, and `tasks` designed under Third Normal Form (3NF).
- Role-based account modeling: Native `role` attribute on `users` with CHECK constraint supporting `'user'` and `'admin'` privileges.
- Strict integrity constraints: Mandatory NOT NULL attributes, table-level UNIQUE constraints, and native CHECK constraints.
- Automated referential integrity: Cascading deletions (`ON DELETE CASCADE`) for user-owned records and nullification (`ON DELETE SET NULL`) for category-associated tasks.
- Performance indexing: Dedicated B-Tree indexes for single-column lookups (`user_id`, `due_date`) and composite filtering (`user_id`, `status`).
- Per-user data isolation: Query design pattern enforcing `user_id` filtering on all operations to prevent cross-tenant data leaks.
- Administrative monitoring: Dedicated system-wide analytics queries for admin oversight without violating regular user isolation boundaries.
- Incremental migrations: Forward schema migration scripts for existing databases alongside fresh full-schema DDL.
- Idempotent scripts: Re-runnable `schema.sql` and `seed.sql` with deterministic sequence resets.
- Zero-residual verification suite: Automated test harness running in an isolated transaction that tests 22 structural checks plus a version check and issues an explicit `ROLLBACK`.
- Backup and restore procedures: Platform-specific command patterns for lossless database snapshots and restoration.

---

## 3. Folder Structure

```
database/
├── .env.example              Reference template for database connection settings (not required by the application).
├── README.md                 Comprehensive technical documentation and operational guide.
├── er-diagram.md             Entity-Relationship documentation containing Mermaid ER specification.
├── er-diagram.png            Rendered visual export of the database Entity-Relationship model.
├── queries.sql               Parameterized application queries covering CRUD and dashboard metrics.
├── schema.sql                Idempotent DDL script defining tables, keys, constraints, and indexes.
├── seed.sql                  Deterministic mock data (3 users, 3 categories, 9 tasks) for development.
├── backup/
│   └── todo_db.sql           Database backup dump generated via mysqldump (generated file).
├── migrations/
│   └── 001_add_user_role.sql Forward migration to add role column to existing databases without data loss.
└── tests/
    ├── run_tests.md          Detailed test execution manual and output interpretation guide.
    └── verify_schema.sql     Automated SQL test suite running in a transaction with rollback.
```

Note: `database/backup/todo_db.sql` is a generated file produced when executing the backup procedures.

---

## 4. Prerequisites

- MySQL Server 8.0.16 or newer:
  - MySQL versions prior to 8.0.16 parse `CHECK` constraints syntactically but silently ignore them during execution. MySQL 8.0.16+ is strictly required to enforce allowed values for user roles, task status, and priority.
- Verification command:
  ```bash
  mysql --version
  ```
  Ensure the output reports MySQL 8.0.16 or higher (e.g., `mysql Ver 8.0.44 for Win64 on x86_64`).
- MySQL CLI Client: Ensure the `mysql` and `mysqldump` client binaries are registered on your system `PATH`.
- Graphical Management (Optional): MySQL Workbench or DBeaver can be used for visual table inspection.

---

## 5. Database Design

### Entity-Relationship Diagram

The visual diagram is stored in `database/er-diagram.png`. The underlying Mermaid specification from `database/er-diagram.md` is rendered below:

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

### Data Dictionary

#### Table: `users`

| Column | Type | Nullable | Key / Constraint | Default | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `INT` | NO | PRIMARY KEY, AUTO_INCREMENT | None | Unique identifier for each user account. |
| `name` | `VARCHAR(100)` | NO | None | None | Full display name of the user. |
| `email` | `VARCHAR(255)` | NO | UNIQUE | None | Unique login email address. |
| `password_hash` | `VARCHAR(255)` | NO | None | None | Securely hashed password string (e.g., bcrypt/Argon2). |
| `role` | `VARCHAR(10)` | NO | CHECK (`role` IN ('user', 'admin')) | `'user'` | Account access level for application authorization. |

#### Table: `categories`

| Column | Type | Nullable | Key / Constraint | Default | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `INT` | NO | PRIMARY KEY, AUTO_INCREMENT | None | Unique identifier for each category. |
| `user_id` | `INT` | NO | FOREIGN KEY (`users.id`), ON DELETE CASCADE | None | User who created and owns this category. |
| `name` | `VARCHAR(100)` | NO | UNIQUE (`user_id`, `name`) | None | Category title; unique per individual user. |

#### Table: `tasks`

| Column | Type | Nullable | Key / Constraint | Default | Description |
| :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `INT` | NO | PRIMARY KEY, AUTO_INCREMENT | None | Unique identifier for each task item. |
| `user_id` | `INT` | NO | FOREIGN KEY (`users.id`), ON DELETE CASCADE | None | User who owns this task. |
| `category_id` | `INT` | YES | FOREIGN KEY (`categories.id`), ON DELETE SET NULL | NULL | Associated category; nullable if uncategorized. |
| `title` | `VARCHAR(200)` | NO | None | None | Title and concise summary of the task. |
| `description` | `TEXT` | YES | None | NULL | Detailed notes or Markdown content. |
| `status` | `VARCHAR(20)` | NO | CHECK (`status` IN ('pending', 'in_progress', 'completed')) | `'pending'` | Current execution stage of the task. |
| `priority` | `VARCHAR(10)` | NO | CHECK (`priority` IN ('low', 'medium', 'high')) | `'medium'` | Importance level of the task. |
| `due_date` | `DATE` | YES | None | NULL | Target deadline date (YYYY-MM-DD). |
| `created_at` | `DATETIME` | NO | None | `CURRENT_TIMESTAMP` | System timestamp when record was inserted. |

### Relationships

- `users` to `categories` (1:N): One user can create zero or more categories. Each category belongs to exactly one user.
- `users` to `tasks` (1:N): One user can own zero or more tasks. Each task belongs to exactly one user.
- `categories` to `tasks` (1:N optional): One category can group zero or more tasks. A task optionally belongs to zero or one category (`category_id` can be NULL).

### Allowed Values

- `users.role`: `'user'`, `'admin'`.
- `tasks.status`: `'pending'`, `'in_progress'`, `'completed'`.
- `tasks.priority`: `'low'`, `'medium'`, `'high'`.

### Design Decisions and Rationale

- `role` Column on `users`: Storing role directly as a `VARCHAR(10)` with a CHECK constraint avoids unnecessary join tables for simple role hierarchies while ensuring strict schema-level data validation.
- `ON DELETE CASCADE` on `user_id`: When a user account is deleted, all their personal categories and tasks are automatically purged to prevent orphan data and comply with data privacy principles.
- `ON DELETE SET NULL` on `category_id`: Categories are organizational labels. Deleting a category must not destroy a user's actual tasks; instead, the foreign key resets to `NULL`, leaving the task in an uncategorized state.
- `UNIQUE(user_id, name)` on `categories`: Users cannot create two categories with identical names. However, separate users can each have their own category with the same name (e.g., both User 1 and User 2 can have a "Work" category).
- `utf8mb4` Encoding: Full Unicode support covering multilingual characters, special symbols, and emojis across all text columns, configured with `utf8mb4_unicode_ci` collation.
- `VARCHAR` with `CHECK` over `ENUM`: MySQL `ENUM` types introduce schema migration overhead when adding new statuses and produce non-standard DDL. `VARCHAR` with `CHECK` constraints gives equal data validation while remaining portable and easy to extend.
- Password Security (`password_hash`): Passwords are never stored in plaintext. The database only stores cryptographic password hashes with a width of 255 characters to accommodate bcrypt, PBKDF2, or Argon2 outputs.
- Hard Deletes: Task deletion performs a physical `DELETE` rather than a soft-delete status flag. Hard deletion simplifies indexes, reduces query complexity, avoids index bloat on soft-deleted rows, and strictly respects user intent.

### Indexes

| Index Name | Table | Columns Indexed | Query Target / Operational Purpose |
| :--- | :--- | :--- | :--- |
| `idx_tasks_user_id` | `tasks` | `(user_id)` | Fast lookup of all tasks owned by a specific user (Query 1). |
| `idx_tasks_user_id_status` | `tasks` | `(user_id, status)` | Fast lookup for status-filtered task lists and status count aggregations (Queries 2 and 7). |
| `idx_tasks_due_date` | `tasks` | `(due_date)` | Accelerates sorting by deadline and filtering upcoming/overdue tasks (Query 4). |

---

## 6. Roles and Admin

The application supports two user roles:
- `user`: Standard account. Allowed to create, edit, filter, and delete their own tasks and categories.
- `admin`: Elevated administrative account. Allowed to view system-wide user rosters, monitor active tasks in progress across users, and inspect aggregate completion progress.

### How to Create an Admin Account
To create a functional administrator account:
1. Register a normal user through the application registration form (which defaults strictly to `role = 'user'`).
2. Have an authorized database administrator upgrade the user's role directly in MySQL:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your_user_email@example.com';
   ```

### Important Security Boundaries
1. **Public Registration Policy**: Public user registration endpoints must **never** accept or parse a `role` attribute from client HTTP requests. All public signups must default strictly to `role = 'user'`.
2. **Seed Admin Placeholder Hash**: The seeded admin account (`admin@example.com` in `seed.sql`) is configured with a dummy bcrypt placeholder hash. This seeded account **cannot** log in through the application until real cryptographic password hashes are generated by the backend or an upgraded real user account is utilized.
3. **Authorization Enforcement**: The database only stores and validates the `role` value. The backend application must explicitly verify the user's role on every administrative endpoint and reject unauthorized requests.

---

## 7. Migration vs. Fresh Setup (schema.sql vs. migrations/)

Understanding which script to execute is critical to preventing unintentional data loss:

| Operational Scenario | Target Script | Execution Effect |
| :--- | :--- | :--- |
| **Fresh Database Setup** | `database/schema.sql` | **Wipes and recreates all tables.** Issues `DROP TABLE IF EXISTS` statements. Used for initial setup on local development machines or clean test databases. |
| **Existing Database with Live Data** | `database/migrations/001_add_user_role.sql` | **Preserves existing data.** Executes an `ALTER TABLE users ADD COLUMN role ...` statement to apply schema enhancements without dropping tables or losing user records. |

### Running the Migration Script on an Existing Database

If you already have a populated database and need to upgrade it with the `role` column:

- **Windows (PowerShell)**:
  ```powershell
  mysql -u root -p todo_db -e "source database/migrations/001_add_user_role.sql"
  ```
- **macOS / Linux**:
  ```bash
  mysql -u root -p todo_db < database/migrations/001_add_user_role.sql
  ```

---

## 8. Quick Start (Run It Yourself)

Execute all commands from the **repository root directory** (`to-do-application-grp18`).

### Step 1: Create Database and Tables

Apply `database/schema.sql` to initialize `todo_db` and create the schema:

- **Windows (PowerShell)**:
  ```powershell
  mysql -u root -p -e "source database/schema.sql"
  ```
- **macOS / Linux**:
  ```bash
  mysql -u root -p < database/schema.sql
  ```

### Step 2: Create Limited-Privilege Application User

Log in as `root` and provision a dedicated application user (`todo_user`) restricted to Data Manipulation Language (DML) operations:

```sql
-- Connect to MySQL as root: mysql -u root -p
CREATE USER IF NOT EXISTS 'todo_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON todo_db.* TO 'todo_user'@'localhost';
FLUSH PRIVILEGES;
```
*Note: Replace `your_password` with a strong local development password of your choice.*

### Step 3: Load Sample Data

Populate mock accounts, categories, and tasks using `database/seed.sql`:

- **Windows (PowerShell)**:
  ```powershell
  mysql -u todo_user -p todo_db -e "source database/seed.sql"
  ```
- **macOS / Linux**:
  ```bash
  mysql -u todo_user -p todo_db < database/seed.sql
  ```

### Step 4: Verify Table Structures and Seed Counts

Run verification queries from the MySQL CLI:

```sql
USE todo_db;

-- 1. Verify all 3 tables exist
SHOW TABLES;

-- 2. Inspect table definitions
DESCRIBE users;
DESCRIBE categories;
DESCRIBE tasks;

-- 3. Verify deterministic seed counts
SELECT COUNT(*) AS user_count FROM users;          -- Expected output: 3 (2 standard, 1 admin)
SELECT COUNT(*) AS category_count FROM categories;  -- Expected output: 3
SELECT COUNT(*) AS task_count FROM tasks;          -- Expected output: 9
```

---

## 9. Connecting from the Backend

### Connection String Format

Backend applications (such as Flask using SQLAlchemy and PyMySQL) connect using the following URI format:

```text
mysql+pymysql://todo_user:your_password@localhost:3306/todo_db
```

### Environment Configuration

The backend uses `Backend/.env` as the single source of truth for database connection settings.

Create `Backend/.env` using `Backend/.env.example` as a reference and configure the `DATABASE_URL` connection string.

The `database/.env` file is not required. No database scripts, migrations, tests, or application code load it. `database/.env.example` is retained only as a reference template.

**Important:**
- Keep database credentials in `Backend/.env`.
- Never commit `.env` files or expose database passwords.
- The backend must connect using the limited-privilege `todo_user` account, not `root`.
- The database SQL scripts are executed directly through the MySQL CLI and do not require a `.env` file.

---

## 10. Sample Data

The `database/seed.sql` script loads deterministic development data:
- **3 Users**:
  - Alice Johnson (`alice@example.com`, ID: 1, role: `'user'`)
  - Bob Smith (`bob@example.com`, ID: 2, role: `'user'`)
  - Admin (`admin@example.com`, ID: 3, role: `'admin'`)
  - Notice: All `password_hash` values in `seed.sql` are placeholder strings (`$2b$12$...placeholderhash...`). Seed users cannot authenticate through the backend authentication endpoints until real cryptographic hashes are generated by the backend.
- **3 Categories**:
  - User 1 (Alice): "Work" (ID: 1), "Personal" (ID: 2)
  - User 2 (Bob): "Study" (ID: 3)
- **9 Tasks**:
  - Realistic task entries with mixed statuses (4 pending, 2 in_progress, 3 completed), mixed priorities (2 low, 3 medium, 4 high), varied deadlines (past due, near term, future, and NULL due dates), and uncategorized tasks (`category_id = NULL`). The admin user has 0 tasks.
- Re-runnable: `seed.sql` safely deletes existing table rows and resets auto-increment IDs back to 1 before inserting records.

---

## 11. Common Queries

All application queries are documented in `database/queries.sql`. Queries are organized into two distinct operational categories:

### Section 1: User-Scoped Queries (Filtered by user_id)
These queries strictly enforce `user_id` filtering for data isolation. Sample UPDATE and DELETE statements are wrapped in `START TRANSACTION ... ROLLBACK` blocks so running the file never alters seed data:

| Query | Purpose | Key SQL Characteristics |
| :--- | :--- | :--- |
| **Query 1** | List user's tasks | Retrieves tasks for one user with category names via `LEFT JOIN categories`. |
| **Query 2** | Filter by status | Filters user tasks by status (`pending`, etc.) utilizing `idx_tasks_user_id_status`. |
| **Query 3** | Search by title | Substring search using `LIKE CONCAT('%', @search_term, '%')` scoped by user. |
| **Query 4** | Sort by priority and due date | Sorts by due date ascending (NULL dates last) and custom priority order (`high` > `medium` > `low`). |
| **Query 5** | Update task status | Updates status enforcing `WHERE id = ? AND user_id = ?` (wrapped in rollback). |
| **Query 6** | Delete task | Deletes a task enforcing `WHERE id = ? AND user_id = ?` (wrapped in rollback). |
| **Query 7** | Count tasks per status | Aggregates metric counts grouped by status for user dashboard cards. |
| **Query 8** | EXPLAIN execution plan | Analyzes index usage to confirm user queries use `ref` access instead of table scans. |

### Section 2: ADMIN ONLY (Not Scoped to One User)
These queries support global administration and intentionally do not filter by a single `user_id`:

| Query | Purpose | Key SQL Characteristics |
| :--- | :--- | :--- |
| **Admin A** | All users with task counts | Lists all users with role, total tasks, and counts of pending, in_progress, and completed. |
| **Admin B** | All tasks with owner details | Lists all tasks with owner name, email, status, priority, and due date, ordered by user and status. |
| **Admin C** | Tasks in progress per user | Pinpoints tasks currently in progress across all users. |
| **Admin D** | User progress and percentage | Computes total, completed, and completion percentage per user, guarded against division by zero. |
| **Admin E** | Overall system progress | Aggregates overall system task totals, counts, and completion percentages. |

### Running the Queries Script

From the repository root:

- **Windows (PowerShell)**:
  ```powershell
  mysql -u todo_user -p todo_db -e "source database/queries.sql"
  ```
- **macOS / Linux**:
  ```bash
  mysql -u todo_user -p todo_db < database/queries.sql
  ```

---

## 12. Testing and Verification

### How to Run

Execute the automated test harness from the repository root:

- **Windows (PowerShell)**:
  ```powershell
  mysql -u root -p todo_db --table -e "source database/tests/verify_schema.sql"
  ```
- **macOS / Linux**:
  ```bash
  mysql -u root -p todo_db --table < database/tests/verify_schema.sql
  ```

*Note: The test suite must be run as `root` because it compiles and executes a temporary stored procedure (`verify_schema_suite`) requiring routine creation privileges.*

### Automated Test Matrix (23 Checks)

| Check # | Verification Target | Expected Behavior |
| :---: | :--- | :--- |
| **0** | MySQL Version Support | Verifies engine is >= 8.0.16 so CHECK constraints are actively enforced. |
| **1** | Table Existence | Confirms `users`, `categories`, and `tasks` base tables exist in `todo_db`. |
| **2** | Column & Type Specification | Validates all 17 column names, data types, lengths, and nullabilities. |
| **3** | Foreign Key Delete Rules | Confirms `CASCADE` on `user_id` and `SET NULL` on `category_id`. |
| **4** | Index & Constraint Existence | Confirms unique constraints and all three performance indexes exist. |
| **5** | Default Column Values | Confirms `status='pending'`, `priority='medium'`, and timestamp defaults apply. |
| **6** | Duplicate Email Rejection | Confirms inserting an existing email raises a UNIQUE violation error. |
| **7** | NULL Title Rejection | Confirms task insertion with a NULL title raises a NOT NULL violation error. |
| **8** | Invalid Status Rejection | Confirms invalid status values (e.g., `'done'`) violate CHECK constraint. |
| **9** | Invalid Priority Rejection | Confirms invalid priority values (e.g., `'urgent'`) violate CHECK constraint. |
| **10** | Orphan Task User Rejection | Confirms non-existent `user_id` foreign key is blocked. |
| **11** | Orphan Task Category Rejection | Confirms non-existent `category_id` foreign key is blocked. |
| **12** | Scoped Category Uniqueness | Confirms duplicate category blocked for same user, permitted for different users. |
| **13** | User Cascade Deletion | Confirms deleting a user deletes their associated categories and tasks. |
| **14** | Category Nullification Deletion | Confirms deleting a category preserves tasks and resets `category_id` to NULL. |
| **15** | User Query Data Isolation | Confirms user query returns only caller-owned rows with zero leakage. |
| **16** | Query Index Utilization | Confirms task list query uses an index (`key` column is not NULL). |
| **17** | Default Role Value | Confirms user `role` defaults to `'user'` on minimal insert. |
| **18** | Invalid Role Rejection | Confirms invalid role values (e.g., `'superuser'`) violate CHECK constraint. |
| **19** | NULL Role Rejection | Confirms inserting a NULL role raises a NOT NULL violation error. |
| **20** | Admin Progress Row Count | Confirms admin user progress query returns exactly one row per registered user. |
| **21** | Progress Status Sum Verification | Confirms pending + in_progress + completed task counts equal total tasks. |
| **22** | Seed Data Admin Ownership | Confirms exactly 1 admin user with 0 owned tasks (WARN if custom data). |

### Interpreting Output

The script outputs two tables:
1. Detailed Test Breakdown: Displays `#`, `Test Name`, `Status` (`PASS`, `FAIL`, or `WARN`), and `Details`.
2. Summary Table: Aggregates total test counts.

Expected Summary Output:
```
+-------------+--------+--------+----------+
| total_tests | passed | failed | warnings |
+-------------+--------+--------+----------+
|          23 |     23 |      0 |        0 |
+-------------+--------+--------+----------+
```

### Safety and Execution Rules

- Zero Residual Data: The test procedure wraps all operations inside `START TRANSACTION;` and issues an explicit `ROLLBACK;` prior to completion. Persistent seed records are unaffected.
- Safe for Repeated Runs: The test harness can be executed repeatedly in continuous integration (CI) or local environments without side effects.
- When to Run: Run tests after any modification to `schema.sql` or migrations and before creating any pull request into `develop`.
- What to Do if a Test Fails: Never modify a test to make it pass. Inspect the failing check number and details, adjust `database/schema.sql` to resolve the defect, re-run `schema.sql`, and re-test.

---

## 13. Backup and Restore

### Creating a Backup

Generate a full schema and data snapshot into `database/backup/todo_db.sql`:

- **Windows (PowerShell)**:
  ```powershell
  # Create backup directory if missing
  if (!(Test-Path "database\backup")) { New-Item -ItemType Directory -Path "database\backup" }

  # Generate dump using --result-file to prevent PowerShell UTF-16 redirection corruption
  mysqldump -u root -p --result-file="$PWD\database\backup\todo_db.sql" todo_db
  ```
- **macOS / Linux**:
  ```bash
  mkdir -p database/backup
  mysqldump -u root -p todo_db > database/backup/todo_db.sql
  ```

### Restoring from Backup

Restore tables and data from the backup file:

- **Windows (PowerShell)**:
  ```powershell
  mysql -u root -p -e "source database/backup/todo_db.sql"
  ```
- **macOS / Linux**:
  ```bash
  mysql -u root -p todo_db < database/backup/todo_db.sql
  ```

---

## 14. Resetting the Database

To completely wipe and rebuild the database back to a clean development state, re-execute the schema and seed scripts:

- **Windows (PowerShell)**:
  ```powershell
  mysql -u root -p -e "source database/schema.sql"
  mysql -u todo_user -p todo_db -e "source database/seed.sql"
  ```
- **macOS / Linux**:
  ```bash
  mysql -u root -p < database/schema.sql
  mysql -u todo_user -p todo_db < database/seed.sql
  ```

Warning: Re-running `schema.sql` issues `DROP TABLE IF EXISTS` statements. All custom data entered after seeding will be permanently erased.

---

## 15. Troubleshooting

| Symptom | Root Cause | Solution |
| :--- | :--- | :--- |
| `Failed to open file 'database\schema.sql', error: 2` | The command was executed from the wrong working directory. | Change directory (`cd`) to the repository root (`to-do-application-grp18`) before running commands. |
| `ERROR 2003 (HY000): Can't connect to MySQL server on 'localhost' (10061)` | The MySQL background service is stopped or not listening on port 3306. | Start the service in an elevated PowerShell terminal: `net start MySQL80` (or via Windows Services GUI `services.msc`). |
| `ERROR 1045 (28000): Access denied for user` | Incorrect password supplied, or the application user `todo_user` has not been provisioned. | Verify the password. Ensure Step 2 of Quick Start was completed as root. For lost root passwords, consult the reset guide below. |
| `'mysql' is not recognized as an internal or external command` | MySQL installation `bin` folder is missing from system `PATH`. | Add `C:\Program Files\MySQL\MySQL Server 8.0\bin` to Windows Environment Variables `PATH`, or use the MySQL Command Line Client. |
| `The '<' operator is reserved for future use` | Running bash input redirection syntax `<` in Windows PowerShell. | PowerShell does not support `<`. Use `-e "source <path>"` syntax as shown in the Windows instructions. |
| `mysqldump: Got error: ... Can't create/write to file` | Target backup directory does not exist or lacks write permissions. | Create the directory first: `New-Item -ItemType Directory -Path "database\backup"` (or `mkdir -p database/backup`). |
| CHECK constraint not enforced (invalid values accepted) | MySQL server version is older than 8.0.16. | Upgrade your MySQL server instance to version 8.0.16 or higher (version 8.0.44 is verified). |

### Root Password Recovery Pointer

If the local MySQL `root` password is lost:
1. Stop the MySQL service: `net stop MySQL80`.
2. Create a one-line text file `C:\mysql-init.txt` containing:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
   ```
3. Default Windows MySQL data directory is located at `C:\ProgramData\MySQL\MySQL Server 8.0\Data`, and configuration is at `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`.
4. Start MySQL once with the init file in an administrative prompt:
   ```cmd
   "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --defaults-file="C:\ProgramData\MySQL\MySQL Server 8.0\my.ini" --init-file="C:\mysql-init.txt" --console
   ```
5. Terminate the process (`Ctrl + C`), delete `C:\mysql-init.txt`, and restart the standard service: `net start MySQL80`.

### Avoiding Plaintext Passwords in Terminal

To avoid typing passwords or leaving credential traces in shell history, use `mysql_config_editor` to create an encrypted login path:

```bash
mysql_config_editor set --login-path=local --host=localhost --user=todo_user --password
```
*(Enter password when prompted)*

You can then connect securely without passwords in CLI flags:
```bash
mysql --login-path=local todo_db
```

Never store plain text passwords in shell scripts or committed git files.

---

## 16. Contract for Teammates

The table and column definitions below represent the strict schema contract for the backend (Flask / SQLAlchemy) and frontend (React / TypeScript) teammates.

| Table Name | Column Name | Data Type | Nullable | Constraints / Allowed Values | Default Value |
| :--- | :--- | :--- | :---: | :--- | :--- |
| `users` | `id` | `INT` | NO | PRIMARY KEY, AUTO_INCREMENT | None |
| `users` | `name` | `VARCHAR(100)` | NO | None | None |
| `users` | `email` | `VARCHAR(255)` | NO | UNIQUE | None |
| `users` | `password_hash` | `VARCHAR(255)` | NO | None | None |
| `users` | `role` | `VARCHAR(10)` | NO | CHECK IN ('user', 'admin') | `'user'` |
| `categories` | `id` | `INT` | NO | PRIMARY KEY, AUTO_INCREMENT | None |
| `categories` | `user_id` | `INT` | NO | FK -> `users.id`, ON DELETE CASCADE | None |
| `categories` | `name` | `VARCHAR(100)` | NO | UNIQUE (`user_id`, `name`) | None |
| `tasks` | `id` | `INT` | NO | PRIMARY KEY, AUTO_INCREMENT | None |
| `tasks` | `user_id` | `INT` | NO | FK -> `users.id`, ON DELETE CASCADE | None |
| `tasks` | `category_id` | `INT` | YES | FK -> `categories.id`, ON DELETE SET NULL | NULL |
| `tasks` | `title` | `VARCHAR(200)` | NO | None | None |
| `tasks` | `description` | `TEXT` | YES | None | NULL |
| `tasks` | `status` | `VARCHAR(20)` | NO | CHECK IN ('pending', 'in_progress', 'completed') | `'pending'` |
| `tasks` | `priority` | `VARCHAR(10)` | NO | CHECK IN ('low', 'medium', 'high') | `'medium'` |
| `tasks` | `due_date` | `DATE` | YES | None | NULL |
| `tasks` | `created_at` | `DATETIME` | NO | None | `CURRENT_TIMESTAMP` |

Important: Any schema changes must be agreed upon with the team in advance. Once approved, update `database/schema.sql`, re-run `database/tests/verify_schema.sql`, and update `database/er-diagram.md`.

---

## 17. Security Notes

- Secret Protection: Never commit `.env` files, production credentials, or real passwords to version control.
- Seed Hashes: All hashes in `database/seed.sql` are dummy mock strings. Seed accounts cannot be used to authenticate until valid password hashes are generated by backend endpoints.
- Role Segregation: Public registration endpoints must never permit client-supplied roles. All signups default to `role = 'user'`. Administrative accounts (`role = 'admin'`) must only be provisioned by database administrators or secure administrative tools.
- Principle of Least Privilege: The application user `todo_user` is restricted strictly to DML operations (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) on `todo_db.*`. It cannot drop databases, alter schemas, or inspect other databases.
- Administrative Segregation: The administrative `root` account must only be used for initial user provisioning, running test harnesses that compile temporary stored procedures, and creating database backup snapshots.

---

## 18. Contributing and Change Checklist

When proposing any modification to the database schema, complete the following checklist:

1. [ ] Update DDL: Implement changes in `database/schema.sql`.
2. [ ] Add Migration: For non-destructive upgrades on live databases, create a timestamped or numbered script in `database/migrations/`.
3. [ ] Update Seed Data: If columns or constraints changed, update `database/seed.sql` with matching test records.
4. [ ] Update Queries: Check `database/queries.sql` to ensure all queries remain valid.
5. [ ] Update Documentation: Update the Mermaid ER model in `database/er-diagram.md` and re-export `database/er-diagram.png`.
6. [ ] Update Data Dictionary: Update the contract and data dictionary tables in `database/README.md`.
7. [ ] Execute Verification Suite: Run `database/tests/verify_schema.sql` and confirm all 23 tests pass.
8. [ ] Submit Pull Request: Commit the changes on the `db` branch and open a pull request targeting `develop`.
