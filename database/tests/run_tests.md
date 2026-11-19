# Running Schema Verification Tests

This guide provides instructions for executing the automated database test suite (`database/tests/verify_schema.sql`) across Windows, macOS, and Linux environments.

---

## 1. Prerequisites

1. **MySQL 8.0.16 or higher** installed and running.
   - Verify version:
     ```bash
     mysql --version
     ```
2. **Database created and schema applied**:
   - The database `todo_db` must exist and `database/schema.sql` must have been executed.

---

## 2. Windows (PowerShell) Commands

Run the commands from the repository root (`to-do-application-grp18`):

### Option A: Using the Application User (`todo_user`)

```powershell
# Method 1: Using the MySQL `source` command (recommended)
mysql -u todo_user -p todo_db -e "source database/tests/verify_schema.sql"

# Method 2: Piping via Get-Content
Get-Content database/tests/verify_schema.sql | mysql -u todo_user -p todo_db
```

### Option B: Using the `root` User

```powershell
mysql -u root -p todo_db -e "source database/tests/verify_schema.sql"
```

> **Note**: Enter the password when prompted.

---

## 3. macOS and Linux (Bash / Zsh) Commands

Run the commands from the repository root (`to-do-application-grp18`):

### Option A: Using the Application User (`todo_user`)

```bash
# Method 1: Standard input redirection
mysql -u todo_user -p todo_db < database/tests/verify_schema.sql

# Method 2: Using the MySQL `source` command
mysql -u todo_user -p todo_db -e "source database/tests/verify_schema.sql"
```

### Option B: Using the `root` User

```bash
mysql -u root -p todo_db < database/tests/verify_schema.sql
```

---

## 4. How to Read the Output

The test suite returns **two result sets**:

### Result Set 1: Individual Test Breakdown

A table with 4 columns:
- **`#`**: Test number (0 through 16).
- **`Test Name`**: Description of the constraint, relation, or behavior under test.
- **`Status`**:
  - `PASS` (Green flag): The constraint or operation functioned exactly as designed.
  - `FAIL` (Red flag): A constraint was missing, violated, or returned unexpected values.
  - `WARN` (Yellow advisory): Informational notice (e.g. MySQL version advisory).
- **`Details`**: Diagnostic details, matched metadata, or error context.

#### Example Output:

```
+----+---------------------------------------------------------------+--------+-----------------------------------------------------------------+
| #  | Test Name                                                     | Status | Details                                                         |
+----+---------------------------------------------------------------+--------+-----------------------------------------------------------------+
|  0 | MySQL Version >= 8.0.16                                       | PASS   | Version 8.0.44 enforces CHECK constraints                       |
|  1 | All 3 tables exist (users, categories, tasks)                 | PASS   | Tables users, categories, tasks confirmed                       |
|  2 | Table columns, data types, and nullability                    | PASS   | All 16 columns exactly match specification                      |
|  3 | Foreign key delete rules (CASCADE and SET NULL)               | PASS   | CASCADE on user_id, SET NULL on category_id verified            |
|  4 | Required indexes and unique constraints                       | PASS   | email UNIQUE, (user_id, name) UNIQUE, and 3 task indexes...     |
|  5 | Default values on minimal task insert                         | PASS   | status=pending, priority=medium, created_at timestamp set       |
|  6 | Duplicate email rejection                                     | PASS   | Duplicate email correctly rejected by UNIQUE constraint         |
|  7 | NULL title rejection on task                                  | PASS   | NULL task title correctly rejected by NOT NULL constraint       |
|  8 | Invalid status rejection (CHECK constraint)                   | PASS   | Invalid status "done" correctly rejected by CHECK constraint    |
|  9 | Invalid priority rejection (CHECK constraint)                 | PASS   | Invalid priority "urgent" correctly rejected by CHECK constraint|
| 10 | Non-existent user_id rejection (FK constraint)                | PASS   | Foreign key constraint prevented orphan task creation           |
| 11 | Non-existent category_id rejection (FK constraint)            | PASS   | Foreign key constraint prevented invalid category assignment    |
| 12 | Category name uniqueness scoped per user                      | PASS   | Duplicate rejected for same user; permitted for different user  |
| 13 | User deletion cascades to tasks and categories                | PASS   | ON DELETE CASCADE removed associated categories and tasks       |
| 14 | Category deletion sets category_id to NULL                    | PASS   | ON DELETE SET NULL preserved task and cleared category_id       |
| 15 | User task list query returns isolated user data               | PASS   | Retrieved exactly 2 user-owned tasks with zero cross-tenant...  |
| 16 | Task list query index usage (key is not NULL)                 | PASS   | Leading index column user_id confirmed on `idx_tasks_user_id`   |
+----+---------------------------------------------------------------+--------+-----------------------------------------------------------------+
```

### Result Set 2: Summary Counts

Provides the aggregate score:

```
+-------------+--------+--------+----------+
| total_tests | passed | failed | warnings |
+-------------+--------+--------+----------+
|          17 |     17 |      0 |        0 |
+-------------+--------+--------+----------+
```

Target status: `failed: 0`, `warnings: 0`.

---

## 5. Verifying Query Execution Plan Manually (Check 16)

To visually inspect that MySQL uses an index for task list queries, run:

```sql
USE todo_db;
EXPLAIN SELECT * FROM tasks WHERE user_id = 1;
```

Expected output:
```
+----+-------------+-------+------------+------+---------------------------------------------+-------------------+---------+-------+------+----------+-------+
| id | select_type | table | partitions | type | possible_keys                               | key               | key_len | ref   | rows | filtered | Extra |
+----+-------------+-------+------------+------+---------------------------------------------+-------------------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | tasks | NULL       | ref  | idx_tasks_user_id,idx_tasks_user_id_status  | idx_tasks_user_id | 4       | const |    6 |   100.00 | NULL  |
+----+-------------+-------+------------+------+---------------------------------------------+-------------------+---------+-------+------+----------+-------+
```

Notice:
- `key` is **`idx_tasks_user_id`** (NOT `NULL`).
- `type` is **`ref`** (indexed lookup, NOT `ALL` full-table scan).

---

## 6. Zero Test Data Guarantee

The test suite runs entirely inside a transaction:
1. `START TRANSACTION;` begins the test execution.
2. Temporary records (users, categories, tasks) are created to test validations, cascade rules, and nullability.
3. `ROLLBACK;` is executed before exit.
4. The temporary test procedure and memory table are dropped.

Your persistent database tables (`users`, `categories`, `tasks`) remain in their exact pre-test state.
