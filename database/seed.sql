-- =============================================================================
-- Seed Data: To-Do Application (todo_db)
-- Provides mock data for local development and functional testing:
-- - 3 Users: 2 standard users (Alice, Bob) and 1 admin user
-- - 3 Categories
-- - 9 Tasks (mixed status, priority, due dates, and category associations)
-- =============================================================================

USE todo_db;

-- Clear any existing records and reset auto-increment counters for deterministic IDs
DELETE FROM tasks;
DELETE FROM categories;
DELETE FROM users;

ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE categories AUTO_INCREMENT = 1;
ALTER TABLE tasks AUTO_INCREMENT = 1;

-- =============================================================================
-- 1. SEED USERS (3 Users: 2 Standard Users, 1 Admin User)
-- Note: password_hash values are dummy bcrypt-formatted strings for mock purposes.
-- =============================================================================
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Alice Johnson', 'alice@example.com', '$2b$12$e80yq9gq0QZ3r5eX1b6h8Oplaceholderhashforuser1alice', 'user'),
(2, 'Bob Smith', 'bob@example.com', '$2b$12$k91zr0hr1RA4s6fY2c7i9Pplaceholderhashforuser2bob', 'user'),
(3, 'Admin', 'admin@example.com', '$2b$12$m02as1is2SB5t7gZ3d8j0Qplaceholderhashforadminuser', 'admin');

-- =============================================================================
-- 2. SEED CATEGORIES (3 Categories)
-- Alice owns 'Work' and 'Personal'; Bob owns 'Study'.
-- =============================================================================
INSERT INTO categories (id, user_id, name) VALUES
(1, 1, 'Work'),
(2, 1, 'Personal'),
(3, 2, 'Study');

-- =============================================================================
-- 3. SEED TASKS (9 Tasks with mixed status, priority, and due dates)
-- =============================================================================
INSERT INTO tasks (id, user_id, category_id, title, description, status, priority, due_date, created_at) VALUES
-- Alice's Tasks (user_id = 1)
(1, 1, 1, 'Complete quarterly project roadmap', 'Finalize Q3 milestone deliverables and update team Jira board', 'in_progress', 'high', '2026-11-25', '2026-11-15 09:30:00'),
(2, 1, 1, 'Submit sprint retrospective report', 'Summarize team velocity and sprint blockages for engineering review', 'completed', 'medium', '2026-11-18', '2026-11-14 14:00:00'),
(3, 1, 2, 'Buy weekly groceries', 'Milk, eggs, vegetables, sourdough bread, and coffee beans', 'pending', 'low', '2026-11-20', '2026-11-19 08:00:00'),
(4, 1, 2, 'Schedule annual dental checkup', NULL, 'pending', 'medium', '2026-12-05', '2026-11-19 10:15:00'),
(5, 1, NULL, 'Renew vehicle insurance policy', 'Compare premium quotes online before expiration', 'pending', 'high', '2026-11-22', '2026-11-17 11:20:00'),
(6, 1, 1, 'Review pull request #42', 'Verify unit test coverage and architectural alignment for authentication flow', 'completed', 'high', '2026-11-16', '2026-11-16 13:45:00'),

-- Bob's Tasks (user_id = 2)
(7, 2, 3, 'Read Operating Systems Chapter 5', 'Study process scheduling algorithms, deadlock handling, and concurrency locks', 'in_progress', 'high', '2026-11-24', '2026-11-18 16:00:00'),
(8, 2, 3, 'Complete Database Systems Lab 3', 'Implement B-Tree indexing benchmarks and analyze MySQL execution plans', 'pending', 'medium', '2026-11-28', '2026-11-19 09:00:00'),
(9, 2, NULL, 'Sign up for campus career fair', 'Prepare 5 printed copies of updated resume', 'completed', 'low', NULL, '2026-11-10 11:00:00');
