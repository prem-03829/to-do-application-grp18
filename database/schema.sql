-- =============================================================================
-- Database Schema: To-Do Application (todo_db)
-- Target DBMS: MySQL 8.0.16+
-- Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci | Storage Engine: InnoDB
-- Source of Truth for database schema and subsequent SQLAlchemy backend models.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS todo_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE todo_db;

-- Drop dependent tables in reverse order of foreign key relationships
DROP TABLE IF EXISTS tasks;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- =============================================================================
-- Table: users
-- Stores registered user accounts with credentials.
-- =============================================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Table: categories
-- Stores custom task categories created by users.
-- Uniqueness constraint on (user_id, name) prevents duplicate category names
-- per individual user while allowing identical category names across different users.
-- =============================================================================
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_categories_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_categories_user_name UNIQUE (user_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- Table: tasks
-- Stores to-do tasks belonging to users, optionally organized by category.
-- CHECK constraints enforce valid statuses and priorities.
-- ON DELETE CASCADE ensures user removal cleans up all their tasks.
-- ON DELETE SET NULL retains tasks if their associated category is removed.
-- =============================================================================
CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority VARCHAR(10) NOT NULL DEFAULT 'medium',
    due_date DATE NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tasks_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_category FOREIGN KEY (category_id)
        REFERENCES categories (id) ON DELETE SET NULL,
    CONSTRAINT chk_tasks_status CHECK (status IN ('pending', 'in_progress', 'completed')),
    CONSTRAINT chk_tasks_priority CHECK (priority IN ('low', 'medium', 'high')),
    INDEX idx_tasks_user_id (user_id),
    INDEX idx_tasks_user_id_status (user_id, status),
    INDEX idx_tasks_due_date (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
