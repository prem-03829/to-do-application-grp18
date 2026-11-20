-- =============================================================================
-- Common Application Queries: To-Do Application (todo_db)
-- Reference SQL queries designed for backend implementation (Flask / SQLAlchemy)
--
-- DATA ISOLATION RULE:
-- Standard user-scoped queries (Queries 1-7) MUST ALWAYS filter by `user_id` to
-- maintain strict tenant isolation and prevent cross-user data leaks.
-- In contrast, the administrative queries in Section 2 are intentionally NOT scoped
-- to a single user, as they support global administrative monitoring and dashboards.
--
-- SEED DATA PRESERVATION:
-- The sample UPDATE and DELETE queries (Queries 5 and 6) are wrapped in
-- START TRANSACTION ... ROLLBACK blocks with intermediate verification SELECTs,
-- ensuring that running this entire script never alters persistent seed data.
-- =============================================================================

USE todo_db;

-- =============================================================================
-- SECTION 1: USER-SCOPED QUERIES (STRICTLY FILTERED BY user_id)
-- =============================================================================

-- Preset session variable for testing (Alice: user_id = 1)
SET @current_user_id = 1;

-- -----------------------------------------------------------------------------
-- Query 1: List All Tasks for a Specific User
-- Joins with categories to retrieve category name (or NULL if uncategorized).
-- Uses index: `idx_tasks_user_id` (or prefix of `idx_tasks_user_id_status`).
-- -----------------------------------------------------------------------------
SELECT 
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    t.created_at,
    c.name AS category_name
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = @current_user_id
ORDER BY t.created_at DESC;

-- -----------------------------------------------------------------------------
-- Query 2: Filter One User's Tasks by Status
-- Uses composite index: `idx_tasks_user_id_status` for high-performance lookup.
-- Status parameter options: 'pending', 'in_progress', 'completed'.
-- -----------------------------------------------------------------------------
SET @filter_status = 'pending';

SELECT 
    t.id,
    t.title,
    t.status,
    t.priority,
    t.due_date,
    c.name AS category_name
FROM tasks t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = @current_user_id
  AND t.status = @filter_status
ORDER BY t.due_date ASC;

-- -----------------------------------------------------------------------------
-- Query 3: Search One User's Tasks by Title (LIKE substring search)
-- Combines `user_id` index lookup with pattern matching on task title.
-- -----------------------------------------------------------------------------
SET @search_term = 'report';

SELECT 
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date
FROM tasks t
WHERE t.user_id = @current_user_id
  AND t.title LIKE CONCAT('%', @search_term, '%')
ORDER BY t.created_at DESC;

-- -----------------------------------------------------------------------------
-- Query 4: Sort Tasks by Due Date and Priority
-- Priority order: high (1) -> medium (2) -> low (3).
-- Due date order: earliest first, tasks without due date (NULL) sorted last.
-- -----------------------------------------------------------------------------
SELECT 
    t.id,
    t.title,
    t.status,
    t.priority,
    t.due_date
FROM tasks t
WHERE t.user_id = @current_user_id
ORDER BY 
    CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END ASC,
    t.due_date ASC,
    FIELD(t.priority, 'high', 'medium', 'low') ASC;

-- -----------------------------------------------------------------------------
-- Query 5: Update Task Status (Sample DML)
-- Ensures user isolation: updates task ONLY if it belongs to the authenticated user.
-- Wrapped in START TRANSACTION / ROLLBACK to preserve seed data during test runs.
-- -----------------------------------------------------------------------------
SET @task_id_to_update = 1;
SET @new_status = 'completed';

START TRANSACTION;

UPDATE tasks
SET status = @new_status
WHERE id = @task_id_to_update
  AND user_id = @current_user_id;

-- Inspect updated row within transaction:
SELECT id, title, status, user_id FROM tasks WHERE id = @task_id_to_update;

ROLLBACK;

-- -----------------------------------------------------------------------------
-- Query 6: Delete a Task (Sample DML)
-- Strictly enforces user isolation: prevents deleting tasks owned by other users.
-- Wrapped in START TRANSACTION / ROLLBACK to preserve seed data during test runs.
-- -----------------------------------------------------------------------------
SET @task_id_to_delete = 5;

START TRANSACTION;

DELETE FROM tasks
WHERE id = @task_id_to_delete
  AND user_id = @current_user_id;

-- Verify deletion within transaction (returns empty set):
SELECT id, title FROM tasks WHERE id = @task_id_to_delete;

ROLLBACK;

-- -----------------------------------------------------------------------------
-- Query 7: Count Tasks per Status for a User (Dashboard Summary Metric)
-- Uses index `idx_tasks_user_id_status` to compute aggregation efficiently.
-- -----------------------------------------------------------------------------
SELECT 
    status,
    COUNT(*) AS total_count
FROM tasks
WHERE user_id = @current_user_id
GROUP BY status
ORDER BY FIELD(status, 'pending', 'in_progress', 'completed');

-- -----------------------------------------------------------------------------
-- Query 8: Index Verification with EXPLAIN
-- Confirms that task list queries utilize the defined index (key IS NOT NULL).
-- -----------------------------------------------------------------------------
EXPLAIN SELECT * FROM tasks WHERE user_id = @current_user_id;
EXPLAIN SELECT * FROM tasks WHERE user_id = @current_user_id AND status = 'pending';

-- =============================================================================
-- SECTION 2: ADMIN ONLY (not scoped to one user)
-- These queries support administrative monitoring across all registered users.
-- Accessible strictly to accounts where users.role = 'admin'.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Query Admin A: All Users with Role, Total Tasks, and Counts per Status
-- Displays all registered users with task breakdown (including users with 0 tasks).
-- -----------------------------------------------------------------------------
SELECT 
    u.id AS user_id,
    u.name,
    u.email,
    u.role,
    COUNT(t.id) AS total_tasks,
    COUNT(CASE WHEN t.status = 'pending' THEN 1 END) AS pending_tasks,
    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) AS in_progress_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed_tasks
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
GROUP BY u.id, u.name, u.email, u.role
ORDER BY u.id ASC;

-- -----------------------------------------------------------------------------
-- Query Admin B: All Tasks with Owner's Details Ordered by User then Status
-- Lists all system tasks with owner display name and email address.
-- -----------------------------------------------------------------------------
SELECT 
    t.id AS task_id,
    u.name AS owner_name,
    u.email AS owner_email,
    t.title,
    t.status,
    t.priority,
    t.due_date
FROM tasks t
JOIN users u ON t.user_id = u.id
ORDER BY u.name ASC, FIELD(t.status, 'pending', 'in_progress', 'completed') ASC, t.id ASC;

-- -----------------------------------------------------------------------------
-- Query Admin C: Tasks Currently In Progress per User
-- Pinpoints active tasks that users are currently working on.
-- -----------------------------------------------------------------------------
SELECT 
    u.id AS user_id,
    u.name AS owner_name,
    u.email AS owner_email,
    t.id AS task_id,
    t.title,
    t.priority,
    t.due_date
FROM users u
JOIN tasks t ON u.id = t.user_id
WHERE t.status = 'in_progress'
ORDER BY u.id ASC, t.due_date ASC;

-- -----------------------------------------------------------------------------
-- Query Admin D: Progress per User (Total, Completed, and Completion Percentage)
-- Calculates user productivity percentage, guarded against division by zero.
-- -----------------------------------------------------------------------------
SELECT 
    u.id AS user_id,
    u.name,
    u.email,
    u.role,
    COUNT(t.id) AS total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) AS completed_tasks,
    ROUND(
        CASE 
            WHEN COUNT(t.id) = 0 THEN 0.00
            ELSE (COUNT(CASE WHEN t.status = 'completed' THEN 1 END) / COUNT(t.id)) * 100.00
        END, 
        2
    ) AS completion_percentage
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
GROUP BY u.id, u.name, u.email, u.role
ORDER BY u.id ASC;

-- -----------------------------------------------------------------------------
-- Query Admin E: Overall Progress Across All Users
-- High-level system dashboard metric displaying total tasks, counts, and percentages.
-- -----------------------------------------------------------------------------
SELECT 
    COUNT(*) AS total_tasks,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_count,
    ROUND(
        CASE WHEN COUNT(*) = 0 THEN 0.00 ELSE (COUNT(CASE WHEN status = 'pending' THEN 1 END) / COUNT(*)) * 100.00 END,
        2
    ) AS pending_percentage,
    COUNT(CASE WHEN status = 'in_progress' THEN 1 END) AS in_progress_count,
    ROUND(
        CASE WHEN COUNT(*) = 0 THEN 0.00 ELSE (COUNT(CASE WHEN status = 'in_progress' THEN 1 END) / COUNT(*)) * 100.00 END,
        2
    ) AS in_progress_percentage,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) AS completed_count,
    ROUND(
        CASE WHEN COUNT(*) = 0 THEN 0.00 ELSE (COUNT(CASE WHEN status = 'completed' THEN 1 END) / COUNT(*)) * 100.00 END,
        2
    ) AS completed_percentage
FROM tasks;
