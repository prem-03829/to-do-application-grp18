-- =============================================================================
-- Migration: 001_add_user_role.sql
-- Description: Add `role` column and CHECK constraint to existing `users` table.
--
-- WHEN TO USE THIS SCRIPT:
-- Use this migration ONLY on existing databases that already contain live data
-- (e.g. testing, staging, or production environments) to safely apply the role
-- column without dropping tables or losing existing records.
--
-- WHEN NOT TO USE:
-- Do NOT use this script on fresh database setups. Use `database/schema.sql`
-- instead, which creates the complete and current schema from scratch.
-- =============================================================================


-- Add role column after password_hash with default 'user' and enforce allowed values
ALTER TABLE users
    ADD COLUMN role VARCHAR(10) NOT NULL DEFAULT 'user' AFTER password_hash,
    ADD CONSTRAINT chk_users_role CHECK (role IN ('user', 'admin'));
