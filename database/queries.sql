-- =============================================================================
-- Common Application Queries: To-Do Application (todo_db)
-- Reference SQL queries designed for backend implementation (Flask / SQLAlchemy)
-- All user-scoped queries strictly enforce `user_id` filtering for data isolation.
-- =============================================================================

USE todo_db;

-- Preset session variable for testing (Alice: user_id = 1)
SET @current_user_id = 1;

-- =============================================================================
-- Query 1: List All Tasks for a Specific User
-- Joins with categories to retrieve category name (or NULL if uncategorized).
-- Uses index: `idx_tasks_user_id` (or prefix of `idx_tasks_user_id_status`).
-- =============================================================================
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

-- =============================================================================
-- Query 2: Filter One User's Tasks by Status
-- Uses composite index: `idx_tasks_user_id_status` for high-performance lookup.
-- Status parameter options: 'pending', 'in_progress', 'completed'.
-- =============================================================================
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

-- =============================================================================
-- Query 3: Search One User's Tasks by Title (LIKE substring search)
-- Combines `user_id` index lookup with pattern matching on task title.
-- =============================================================================
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

-- =============================================================================
-- Query 4: Sort Tasks by Due Date and Priority
-- Priority order: high (1) -> medium (2) -> low (3).
-- Due date order: earliest first, tasks without due date (NULL) sorted last.
-- =============================================================================
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

-- =============================================================================
-- Query 5: Update Task Status
-- Ensures user isolation: updates task ONLY if it belongs to the authenticated user.
-- =============================================================================
SET @task_id_to_update = 1;
SET @new_status = 'completed';

UPDATE tasks
SET status = @new_status
WHERE id = @task_id_to_update
  AND user_id = @current_user_id;

-- Verify update:
SELECT id, title, status, user_id FROM tasks WHERE id = @task_id_to_update;

-- =============================================================================
-- Query 6: Delete a Task
-- Strictly enforces user isolation: prevents deleting tasks owned by other users.
-- =============================================================================
SET @task_id_to_delete = 5;

DELETE FROM tasks
WHERE id = @task_id_to_delete
  AND user_id = @current_user_id;

-- Verify deletion:
SELECT id, title FROM tasks WHERE id = @task_id_to_delete;

-- =============================================================================
-- Query 7: Count Tasks per Status for a User (Dashboard Summary Metric)
-- Uses index `idx_tasks_user_id_status` to compute aggregation efficiently.
-- =============================================================================
SELECT 
    status,
    COUNT(*) AS total_count
FROM tasks
WHERE user_id = @current_user_id
GROUP BY status
ORDER BY FIELD(status, 'pending', 'in_progress', 'completed');

-- =============================================================================
-- Query 8: Index Verification with EXPLAIN
-- Confirms that task list queries utilize the defined index (key IS NOT NULL).
-- =============================================================================
EXPLAIN SELECT * FROM tasks WHERE user_id = @current_user_id;
EXPLAIN SELECT * FROM tasks WHERE user_id = @current_user_id AND status = 'pending';
