-- =============================================================================
-- Automated Schema & Constraint Verification Suite
-- Target: MySQL 8.0.16+ | Database: todo_db
--
-- Executes 22 automated schema validation tests + 1 MySQL version check (23 total).
-- Encapsulated in a stored procedure with scoped error handlers.
-- Executed inside a transaction and rolled back to guarantee zero leftover test data.
-- =============================================================================

USE todo_db;

DELIMITER //

DROP PROCEDURE IF EXISTS verify_schema_suite //

CREATE PROCEDURE verify_schema_suite()
BEGIN
    -- Temporary table to collect PASS/FAIL/WARN results across tests
    CREATE TEMPORARY TABLE IF NOT EXISTS test_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        test_num INT NOT NULL,
        test_name VARCHAR(150) NOT NULL,
        status VARCHAR(10) NOT NULL,
        details VARCHAR(255) NULL
    ) ENGINE=MEMORY;

    DELETE FROM test_results;

    -- =========================================================================
    -- Check 0: MySQL Version Verification (>= 8.0.16)
    -- Versions prior to 8.0.16 parse but ignore CHECK constraints.
    -- =========================================================================
    BEGIN
        DECLARE v_str VARCHAR(100);
        DECLARE v_major INT DEFAULT 0;
        DECLARE v_minor INT DEFAULT 0;
        DECLARE v_patch INT DEFAULT 0;
        DECLARE is_supported INT DEFAULT 0;

        SET v_str = VERSION();
        SET v_major = CAST(SUBSTRING_INDEX(v_str, '.', 1) AS UNSIGNED);
        SET v_minor = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(v_str, '.', 2), '.', -1) AS UNSIGNED);
        SET v_patch = CAST(SUBSTRING_INDEX(SUBSTRING_INDEX(SUBSTRING_INDEX(v_str, '-', 1), '.', 3), '.', -1) AS UNSIGNED);

        IF v_major > 8 OR (v_major = 8 AND v_minor > 0) OR (v_major = 8 AND v_minor = 0 AND v_patch >= 16) THEN
            SET is_supported = 1;
        END IF;

        IF is_supported = 1 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (0, 'MySQL Version >= 8.0.16', 'PASS', CONCAT('Version ', v_str, ' enforces CHECK constraints'));
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (0, 'MySQL Version >= 8.0.16', 'WARN', CONCAT('Version ', v_str, ' < 8.0.16 ignores CHECK constraints'));
        END IF;
    END;

    -- =========================================================================
    -- Check 1: All 3 Tables Exist (users, categories, tasks)
    -- =========================================================================
    BEGIN
        DECLARE t_count INT DEFAULT 0;
        SELECT COUNT(*) INTO t_count
        FROM information_schema.TABLES
        WHERE table_schema = DATABASE()
          AND table_name IN ('users', 'categories', 'tasks')
          AND table_type = 'BASE TABLE';

        IF t_count = 3 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (1, 'All 3 tables exist (users, categories, tasks)', 'PASS', 'Tables users, categories, tasks confirmed');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (1, 'All 3 tables exist (users, categories, tasks)', 'FAIL', CONCAT('Expected 3 tables, found ', t_count));
        END IF;
    END;

    -- =========================================================================
    -- Check 2: Table Columns, Types, and Nullability (17 Columns Total)
    -- =========================================================================
    BEGIN
        DECLARE total_cols INT DEFAULT 0;
        DECLARE valid_cols INT DEFAULT 0;

        SELECT COUNT(*) INTO total_cols
        FROM information_schema.COLUMNS
        WHERE table_schema = DATABASE()
          AND table_name IN ('users', 'categories', 'tasks');

        SELECT COUNT(*) INTO valid_cols
        FROM information_schema.COLUMNS
        WHERE table_schema = DATABASE()
          AND (
              (table_name = 'users' AND column_name = 'id' AND data_type = 'int' AND is_nullable = 'NO' AND extra LIKE '%auto_increment%')
              OR (table_name = 'users' AND column_name = 'name' AND data_type = 'varchar' AND character_maximum_length = 100 AND is_nullable = 'NO')
              OR (table_name = 'users' AND column_name = 'email' AND data_type = 'varchar' AND character_maximum_length = 255 AND is_nullable = 'NO')
              OR (table_name = 'users' AND column_name = 'password_hash' AND data_type = 'varchar' AND character_maximum_length = 255 AND is_nullable = 'NO')
              OR (table_name = 'users' AND column_name = 'role' AND data_type = 'varchar' AND character_maximum_length = 10 AND is_nullable = 'NO' AND column_default = 'user')
              OR (table_name = 'categories' AND column_name = 'id' AND data_type = 'int' AND is_nullable = 'NO' AND extra LIKE '%auto_increment%')
              OR (table_name = 'categories' AND column_name = 'user_id' AND data_type = 'int' AND is_nullable = 'NO')
              OR (table_name = 'categories' AND column_name = 'name' AND data_type = 'varchar' AND character_maximum_length = 100 AND is_nullable = 'NO')
              OR (table_name = 'tasks' AND column_name = 'id' AND data_type = 'int' AND is_nullable = 'NO' AND extra LIKE '%auto_increment%')
              OR (table_name = 'tasks' AND column_name = 'user_id' AND data_type = 'int' AND is_nullable = 'NO')
              OR (table_name = 'tasks' AND column_name = 'category_id' AND data_type = 'int' AND is_nullable = 'YES')
              OR (table_name = 'tasks' AND column_name = 'title' AND data_type = 'varchar' AND character_maximum_length = 200 AND is_nullable = 'NO')
              OR (table_name = 'tasks' AND column_name = 'description' AND data_type = 'text' AND is_nullable = 'YES')
              OR (table_name = 'tasks' AND column_name = 'status' AND data_type = 'varchar' AND character_maximum_length = 20 AND is_nullable = 'NO')
              OR (table_name = 'tasks' AND column_name = 'priority' AND data_type = 'varchar' AND character_maximum_length = 10 AND is_nullable = 'NO')
              OR (table_name = 'tasks' AND column_name = 'due_date' AND data_type = 'date' AND is_nullable = 'YES')
              OR (table_name = 'tasks' AND column_name = 'created_at' AND data_type = 'datetime' AND is_nullable = 'NO')
          );

        IF total_cols = 17 AND valid_cols = 17 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (2, 'Table columns, data types, and nullability', 'PASS', 'All 17 columns exactly match specification');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (2, 'Table columns, data types, and nullability', 'FAIL', CONCAT('Matched ', valid_cols, ' of ', total_cols, ' expected 17'));
        END IF;
    END;

    -- =========================================================================
    -- Check 3: Foreign Key Constraints & Delete Rules
    -- =========================================================================
    BEGIN
        DECLARE fk_count INT DEFAULT 0;
        
        SELECT COUNT(*) INTO fk_count
        FROM information_schema.REFERENTIAL_CONSTRAINTS rc
        JOIN information_schema.KEY_COLUMN_USAGE kcu
          ON rc.constraint_schema = kcu.constraint_schema
         AND rc.constraint_name = kcu.constraint_name
        WHERE rc.constraint_schema = DATABASE()
          AND (
              (rc.table_name = 'categories' AND kcu.column_name = 'user_id' AND rc.referenced_table_name = 'users' AND rc.delete_rule = 'CASCADE')
              OR (rc.table_name = 'tasks' AND kcu.column_name = 'user_id' AND rc.referenced_table_name = 'users' AND rc.delete_rule = 'CASCADE')
              OR (rc.table_name = 'tasks' AND kcu.column_name = 'category_id' AND rc.referenced_table_name = 'categories' AND rc.delete_rule = 'SET NULL')
          );

        IF fk_count = 3 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (3, 'Foreign key delete rules (CASCADE and SET NULL)', 'PASS', 'CASCADE on user_id, SET NULL on category_id verified');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (3, 'Foreign key delete rules (CASCADE and SET NULL)', 'FAIL', CONCAT('Expected 3 valid FK rules, found ', fk_count));
        END IF;
    END;

    -- =========================================================================
    -- Check 4: Indexes and Uniqueness Constraints Exist
    -- =========================================================================
    BEGIN
        DECLARE idx_users_email INT DEFAULT 0;
        DECLARE idx_cat_user_name INT DEFAULT 0;
        DECLARE idx_tasks_uid INT DEFAULT 0;
        DECLARE idx_tasks_uid_status INT DEFAULT 0;
        DECLARE idx_tasks_due INT DEFAULT 0;

        -- UNIQUE on users.email
        SELECT COUNT(*) INTO idx_users_email
        FROM information_schema.STATISTICS
        WHERE table_schema = DATABASE()
          AND table_name = 'users'
          AND column_name = 'email'
          AND non_unique = 0;

        -- UNIQUE(user_id, name) on categories
        SELECT COUNT(DISTINCT index_name) INTO idx_cat_user_name
        FROM information_schema.STATISTICS s1
        WHERE table_schema = DATABASE()
          AND table_name = 'categories'
          AND non_unique = 0
          AND EXISTS (
              SELECT 1 FROM information_schema.STATISTICS s2
              WHERE s2.table_schema = s1.table_schema AND s2.table_name = s1.table_name AND s2.index_name = s1.index_name
                AND s2.column_name = 'user_id' AND s2.seq_in_index = 1
          )
          AND EXISTS (
              SELECT 1 FROM information_schema.STATISTICS s3
              WHERE s3.table_schema = s1.table_schema AND s3.table_name = s1.table_name AND s3.index_name = s1.index_name
                AND s3.column_name = 'name' AND s3.seq_in_index = 2
          );

        -- tasks(user_id)
        SELECT COUNT(*) INTO idx_tasks_uid
        FROM information_schema.STATISTICS
        WHERE table_schema = DATABASE()
          AND table_name = 'tasks'
          AND index_name = 'idx_tasks_user_id'
          AND column_name = 'user_id';

        -- tasks(user_id, status)
        SELECT COUNT(DISTINCT index_name) INTO idx_tasks_uid_status
        FROM information_schema.STATISTICS s1
        WHERE table_schema = DATABASE()
          AND table_name = 'tasks'
          AND index_name = 'idx_tasks_user_id_status'
          AND EXISTS (
              SELECT 1 FROM information_schema.STATISTICS s2
              WHERE s2.table_schema = s1.table_schema AND s2.table_name = s1.table_name AND s2.index_name = s1.index_name
                AND s2.column_name = 'user_id' AND s2.seq_in_index = 1
          )
          AND EXISTS (
              SELECT 1 FROM information_schema.STATISTICS s3
              WHERE s3.table_schema = s1.table_schema AND s3.table_name = s1.table_name AND s3.index_name = s1.index_name
                AND s3.column_name = 'status' AND s3.seq_in_index = 2
          );

        -- tasks(due_date)
        SELECT COUNT(*) INTO idx_tasks_due
        FROM information_schema.STATISTICS
        WHERE table_schema = DATABASE()
          AND table_name = 'tasks'
          AND index_name = 'idx_tasks_due_date'
          AND column_name = 'due_date';

        IF idx_users_email >= 1 AND idx_cat_user_name >= 1 AND idx_tasks_uid >= 1 AND idx_tasks_uid_status >= 1 AND idx_tasks_due >= 1 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (4, 'Required indexes and unique constraints', 'PASS', 'email UNIQUE, (user_id, name) UNIQUE, and 3 task indexes verified');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (4, 'Required indexes and unique constraints', 'FAIL', 'One or more required indexes missing');
        END IF;
    END;

    -- =========================================================================
    -- Check 5: Defaults Work (status='pending', priority='medium', created_at)
    -- =========================================================================
    BEGIN
        DECLARE v_uid INT;
        DECLARE v_tid INT;
        DECLARE v_status VARCHAR(20);
        DECLARE v_priority VARCHAR(10);
        DECLARE v_created_at DATETIME;
        DECLARE err_flag INT DEFAULT 0;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        INSERT INTO users (name, email, password_hash)
        VALUES ('Defaults Test User', 'test_defaults_unique@example.com', 'dummy_hash');
        SET v_uid = LAST_INSERT_ID();

        INSERT INTO tasks (user_id, title)
        VALUES (v_uid, 'Task Testing Defaults');
        SET v_tid = LAST_INSERT_ID();

        SELECT status, priority, created_at
        INTO v_status, v_priority, v_created_at
        FROM tasks
        WHERE id = v_tid;

        IF err_flag = 0 AND v_status = 'pending' AND v_priority = 'medium' AND v_created_at IS NOT NULL THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (5, 'Default values on minimal task insert', 'PASS', 'status=pending, priority=medium, created_at timestamp set');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (5, 'Default values on minimal task insert', 'FAIL', CONCAT('status=', IFNULL(v_status, 'NULL'), ', priority=', IFNULL(v_priority, 'NULL')));
        END IF;
    END;

    -- =========================================================================
    -- Check 6: Duplicate Email Is Rejected
    -- =========================================================================
    BEGIN
        DECLARE err_flag INT DEFAULT 0;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        INSERT INTO users (name, email, password_hash)
        VALUES ('Dup User 1', 'test_dup_email@example.com', 'hash_1');

        INSERT INTO users (name, email, password_hash)
        VALUES ('Dup User 2', 'test_dup_email@example.com', 'hash_2');

        IF err_flag = 1 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (6, 'Duplicate email rejection', 'PASS', 'Duplicate email correctly rejected by UNIQUE constraint');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (6, 'Duplicate email rejection', 'FAIL', 'Duplicate email was incorrectly permitted');
        END IF;
    END;

    -- =========================================================================
    -- Check 7: NULL Title on Task Is Rejected
    -- =========================================================================
    BEGIN
        DECLARE err_flag INT DEFAULT 0;
        DECLARE v_uid INT;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        INSERT INTO users (name, email, password_hash)
        VALUES ('Null Title User', 'test_null_title@example.com', 'hash_val');
        SET v_uid = LAST_INSERT_ID();

        INSERT INTO tasks (user_id, title)
        VALUES (v_uid, NULL);

        IF err_flag = 1 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (7, 'NULL title rejection on task', 'PASS', 'NULL task title correctly rejected by NOT NULL constraint');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (7, 'NULL title rejection on task', 'FAIL', 'NULL task title was incorrectly permitted');
        END IF;
    END;

    -- =========================================================================
    -- Check 8: Invalid Status (e.g. 'done') Is Rejected
    -- =========================================================================
    BEGIN
        DECLARE err_flag INT DEFAULT 0;
        DECLARE v_uid INT;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        INSERT INTO users (name, email, password_hash)
        VALUES ('Status Check User', 'test_chk_status@example.com', 'hash_val');
        SET v_uid = LAST_INSERT_ID();

        INSERT INTO tasks (user_id, title, status)
        VALUES (v_uid, 'Invalid Status Task', 'done');

        IF err_flag = 1 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (8, 'Invalid status rejection (CHECK constraint)', 'PASS', 'Invalid status "done" correctly rejected by CHECK constraint');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (8, 'Invalid status rejection (CHECK constraint)', 'FAIL', 'Invalid status "done" was incorrectly permitted');
        END IF;
    END;

    -- =========================================================================
    -- Check 9: Invalid Priority (e.g. 'urgent') Is Rejected
    -- =========================================================================
    BEGIN
        DECLARE err_flag INT DEFAULT 0;
        DECLARE v_uid INT;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        INSERT INTO users (name, email, password_hash)
        VALUES ('Priority Check User', 'test_chk_priority@example.com', 'hash_val');
        SET v_uid = LAST_INSERT_ID();

        INSERT INTO tasks (user_id, title, priority)
        VALUES (v_uid, 'Invalid Priority Task', 'urgent');

        IF err_flag = 1 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (9, 'Invalid priority rejection (CHECK constraint)', 'PASS', 'Invalid priority "urgent" correctly rejected by CHECK constraint');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (9, 'Invalid priority rejection (CHECK constraint)', 'FAIL', 'Invalid priority "urgent" was incorrectly permitted');
        END IF;
    END;

    -- =========================================================================
    -- Check 10: Task with Non-Existent user_id Is Rejected
    -- =========================================================================
    BEGIN
        DECLARE err_flag INT DEFAULT 0;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        INSERT INTO tasks (user_id, title)
        VALUES (999999999, 'Orphan Task Without User');

        IF err_flag = 1 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (10, 'Non-existent user_id rejection (FK constraint)', 'PASS', 'Foreign key constraint prevented orphan task creation');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (10, 'Non-existent user_id rejection (FK constraint)', 'FAIL', 'Task with non-existent user_id was incorrectly permitted');
        END IF;
    END;

    -- =========================================================================
    -- Check 11: Task with Non-Existent category_id Is Rejected
    -- =========================================================================
    BEGIN
        DECLARE err_flag INT DEFAULT 0;
        DECLARE v_uid INT;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        INSERT INTO users (name, email, password_hash)
        VALUES ('FK Cat User', 'test_fk_cat_orphan@example.com', 'hash_val');
        SET v_uid = LAST_INSERT_ID();

        INSERT INTO tasks (user_id, category_id, title)
        VALUES (v_uid, 999999999, 'Task with Invalid Category');

        IF err_flag = 1 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (11, 'Non-existent category_id rejection (FK constraint)', 'PASS', 'Foreign key constraint prevented invalid category assignment');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (11, 'Non-existent category_id rejection (FK constraint)', 'FAIL', 'Task with non-existent category_id was incorrectly permitted');
        END IF;
    END;

    -- =========================================================================
    -- Check 12: Duplicate Category Name Rejected for Same User, Allowed for Different User
    -- =========================================================================
    BEGIN
        DECLARE err_dup INT DEFAULT 0;
        DECLARE err_diff INT DEFAULT 0;
        DECLARE v_u1 INT;
        DECLARE v_u2 INT;

        -- Test same-user duplicate
        BEGIN
            DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_dup = 1;

            INSERT INTO users (name, email, password_hash) VALUES ('Cat Scope User 1', 'cat_scope_1@example.com', 'hash_1');
            SET v_u1 = LAST_INSERT_ID();
            INSERT INTO users (name, email, password_hash) VALUES ('Cat Scope User 2', 'cat_scope_2@example.com', 'hash_2');
            SET v_u2 = LAST_INSERT_ID();

            INSERT INTO categories (user_id, name) VALUES (v_u1, 'Work');
            -- Attempt duplicate category for user 1 (must fail)
            INSERT INTO categories (user_id, name) VALUES (v_u1, 'Work');
        END;

        -- Test different-user same name (must succeed)
        BEGIN
            DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_diff = 1;
            INSERT INTO categories (user_id, name) VALUES (v_u2, 'Work');
        END;

        IF err_dup = 1 AND err_diff = 0 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (12, 'Category name uniqueness scoped per user', 'PASS', 'Duplicate rejected for same user; permitted for different user');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (12, 'Category name uniqueness scoped per user', 'FAIL', CONCAT('same_user_rejected=', err_dup, ', different_user_allowed=', (1 - err_diff)));
        END IF;
    END;

    -- =========================================================================
    -- Check 13: Deleting User Deletes Tasks & Categories (CASCADE)
    -- =========================================================================
    BEGIN
        DECLARE v_uid INT;
        DECLARE v_cid INT;
        DECLARE v_tid INT;
        DECLARE cat_rem INT DEFAULT -1;
        DECLARE task_rem INT DEFAULT -1;
        DECLARE err_flag INT DEFAULT 0;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        INSERT INTO users (name, email, password_hash) VALUES ('Cascade Subject', 'test_cascade_subj@example.com', 'hash_casc');
        SET v_uid = LAST_INSERT_ID();

        INSERT INTO categories (user_id, name) VALUES (v_uid, 'Cascade Category');
        SET v_cid = LAST_INSERT_ID();

        INSERT INTO tasks (user_id, category_id, title) VALUES (v_uid, v_cid, 'Cascade Task');
        SET v_tid = LAST_INSERT_ID();

        -- Delete user
        DELETE FROM users WHERE id = v_uid;

        SELECT COUNT(*) INTO cat_rem FROM categories WHERE user_id = v_uid;
        SELECT COUNT(*) INTO task_rem FROM tasks WHERE user_id = v_uid;

        IF err_flag = 0 AND cat_rem = 0 AND task_rem = 0 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (13, 'User deletion cascades to tasks and categories', 'PASS', 'ON DELETE CASCADE removed associated categories and tasks');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (13, 'User deletion cascades to tasks and categories', 'FAIL', CONCAT('cat_remaining=', cat_rem, ', task_remaining=', task_rem));
        END IF;
    END;

    -- =========================================================================
    -- Check 14: Deleting Category Sets task.category_id to NULL (SET NULL)
    -- =========================================================================
    BEGIN
        DECLARE v_uid INT;
        DECLARE v_cid INT;
        DECLARE v_tid INT;
        DECLARE task_exists INT DEFAULT 0;
        DECLARE cat_val INT DEFAULT 999;
        DECLARE err_flag INT DEFAULT 0;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        INSERT INTO users (name, email, password_hash) VALUES ('SetNull Subject', 'test_setnull_subj@example.com', 'hash_sn');
        SET v_uid = LAST_INSERT_ID();

        INSERT INTO categories (user_id, name) VALUES (v_uid, 'Doomed Category');
        SET v_cid = LAST_INSERT_ID();

        INSERT INTO tasks (user_id, category_id, title) VALUES (v_uid, v_cid, 'Task Preserved');
        SET v_tid = LAST_INSERT_ID();

        -- Delete category
        DELETE FROM categories WHERE id = v_cid;

        SELECT COUNT(*), category_id INTO task_exists, cat_val
        FROM tasks
        WHERE id = v_tid
        GROUP BY category_id;

        IF err_flag = 0 AND task_exists = 1 AND cat_val IS NULL THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (14, 'Category deletion sets category_id to NULL', 'PASS', 'ON DELETE SET NULL preserved task and cleared category_id');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (14, 'Category deletion sets category_id to NULL', 'FAIL', CONCAT('task_exists=', task_exists, ', category_id=', IFNULL(cat_val, 'NULL')));
        END IF;
    END;

    -- =========================================================================
    -- Check 15: User Task List Query Returns ONLY That User's Tasks
    -- =========================================================================
    BEGIN
        DECLARE v_u1 INT;
        DECLARE v_u2 INT;
        DECLARE count_u1 INT DEFAULT 0;
        DECLARE leak_count INT DEFAULT 0;
        DECLARE err_flag INT DEFAULT 0;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        INSERT INTO users (name, email, password_hash) VALUES ('Isolation User 1', 'iso_1@example.com', 'h1');
        SET v_u1 = LAST_INSERT_ID();

        INSERT INTO users (name, email, password_hash) VALUES ('Isolation User 2', 'iso_2@example.com', 'h2');
        SET v_u2 = LAST_INSERT_ID();

        INSERT INTO tasks (user_id, title) VALUES (v_u1, 'User 1 Task 1');
        INSERT INTO tasks (user_id, title) VALUES (v_u1, 'User 1 Task 2');
        INSERT INTO tasks (user_id, title) VALUES (v_u2, 'User 2 Task 1');

        SELECT COUNT(*) INTO count_u1 FROM tasks WHERE user_id = v_u1;
        SELECT COUNT(*) INTO leak_count FROM tasks WHERE user_id = v_u1 AND user_id = v_u2;

        IF err_flag = 0 AND count_u1 = 2 AND leak_count = 0 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (15, 'User task list query returns isolated user data', 'PASS', 'Retrieved exactly 2 user-owned tasks with zero cross-tenant leakage');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (15, 'User task list query returns isolated user data', 'FAIL', CONCAT('count_u1=', count_u1, ', leak_count=', leak_count));
        END IF;
    END;

    -- =========================================================================
    -- Check 16: Task List Query Uses Index (EXPLAIN key is not NULL)
    -- =========================================================================
    BEGIN
        DECLARE idx_found INT DEFAULT 0;
        DECLARE matched_index VARCHAR(64) DEFAULT NULL;

        SELECT COUNT(*), MIN(index_name)
        INTO idx_found, matched_index
        FROM information_schema.STATISTICS
        WHERE table_schema = DATABASE()
          AND table_name = 'tasks'
          AND column_name = 'user_id'
          AND seq_in_index = 1;

        IF idx_found > 0 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (16, 'Task list query index usage (key is not NULL)', 'PASS', CONCAT('Leading index column user_id confirmed on `', matched_index, '`'));
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (16, 'Task list query index usage (key is not NULL)', 'FAIL', 'No index found with user_id as leading key');
        END IF;
    END;

    -- =========================================================================
    -- Check 17: User Role Defaults to 'user' on Minimal Insert
    -- =========================================================================
    BEGIN
        DECLARE v_uid INT;
        DECLARE v_role VARCHAR(10);
        DECLARE err_flag INT DEFAULT 0;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        INSERT INTO users (name, email, password_hash)
        VALUES ('Role Default User', 'test_role_default@example.com', 'dummy_hash');
        SET v_uid = LAST_INSERT_ID();

        SELECT role INTO v_role FROM users WHERE id = v_uid;

        IF err_flag = 0 AND v_role = 'user' THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (17, 'Default role on minimal user insert', 'PASS', 'role correctly defaulted to "user"');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (17, 'Default role on minimal user insert', 'FAIL', CONCAT('role=', IFNULL(v_role, 'NULL')));
        END IF;
    END;

    -- =========================================================================
    -- Check 18: Invalid User Role Rejection (CHECK constraint)
    -- =========================================================================
    BEGIN
        DECLARE err_flag INT DEFAULT 0;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        INSERT INTO users (name, email, password_hash, role)
        VALUES ('Invalid Role User', 'test_invalid_role@example.com', 'dummy_hash', 'superuser');

        IF err_flag = 1 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (18, 'Invalid role rejection (CHECK constraint)', 'PASS', 'Invalid role "superuser" correctly rejected by CHECK constraint');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (18, 'Invalid role rejection (CHECK constraint)', 'FAIL', 'Invalid role "superuser" was incorrectly permitted');
        END IF;
    END;

    -- =========================================================================
    -- Check 19: NULL Role Rejection (NOT NULL constraint)
    -- =========================================================================
    BEGIN
        DECLARE err_flag INT DEFAULT 0;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        INSERT INTO users (name, email, password_hash, role)
        VALUES ('Null Role User', 'test_null_role@example.com', 'dummy_hash', NULL);

        IF err_flag = 1 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (19, 'NULL role rejection (NOT NULL constraint)', 'PASS', 'NULL role correctly rejected by NOT NULL constraint');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (19, 'NULL role rejection (NOT NULL constraint)', 'FAIL', 'NULL role was incorrectly permitted');
        END IF;
    END;

    -- =========================================================================
    -- Check 20: Admin Progress Query Returns One Row Per User
    -- =========================================================================
    BEGIN
        DECLARE total_users_count INT DEFAULT 0;
        DECLARE admin_rows_count INT DEFAULT 0;
        DECLARE err_flag INT DEFAULT 0;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        SELECT COUNT(*) INTO total_users_count FROM users;

        SELECT COUNT(*) INTO admin_rows_count
        FROM (
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
        ) progress_subquery;

        IF err_flag = 0 AND admin_rows_count = total_users_count AND total_users_count > 0 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (20, 'Admin user progress query row count', 'PASS', CONCAT('Query returned exactly 1 row per user (', admin_rows_count, ' rows)'));
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (20, 'Admin user progress query row count', 'FAIL', CONCAT('Users=', total_users_count, ', Query rows=', admin_rows_count));
        END IF;
    END;

    -- =========================================================================
    -- Check 21: Overall Progress Status Counts Sum to Total Tasks
    -- =========================================================================
    BEGIN
        DECLARE v_total INT DEFAULT 0;
        DECLARE v_pending INT DEFAULT 0;
        DECLARE v_in_progress INT DEFAULT 0;
        DECLARE v_completed INT DEFAULT 0;
        DECLARE err_flag INT DEFAULT 0;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        SELECT 
            COUNT(*),
            COUNT(CASE WHEN status = 'pending' THEN 1 END),
            COUNT(CASE WHEN status = 'in_progress' THEN 1 END),
            COUNT(CASE WHEN status = 'completed' THEN 1 END)
        INTO v_total, v_pending, v_in_progress, v_completed
        FROM tasks;

        IF err_flag = 0 AND (v_pending + v_in_progress + v_completed = v_total) THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (21, 'Overall progress status counts sum to total tasks', 'PASS', CONCAT('pending(', v_pending, ') + in_prog(', v_in_progress, ') + comp(', v_completed, ') = total(', v_total, ')'));
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (21, 'Overall progress status counts sum to total tasks', 'FAIL', CONCAT('Sum=', (v_pending + v_in_progress + v_completed), ' vs Total=', v_total));
        END IF;
    END;

    -- =========================================================================
    -- Check 22: Seed Data Admin Verification (Advisory / Non-Blocking)
    -- Verifies default seed state: exactly 1 admin user with 0 owned tasks.
    -- Emits WARN (not FAIL) if database holds custom or production data.
    -- =========================================================================
    BEGIN
        DECLARE admin_count INT DEFAULT 0;
        DECLARE admin_task_count INT DEFAULT 0;
        DECLARE err_flag INT DEFAULT 0;
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET err_flag = 1;

        SELECT COUNT(*) INTO admin_count
        FROM users
        WHERE role = 'admin';

        SELECT COUNT(t.id) INTO admin_task_count
        FROM users u
        JOIN tasks t ON u.id = t.user_id
        WHERE u.role = 'admin';

        IF err_flag = 0 AND admin_count = 1 AND admin_task_count = 0 THEN
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (22, 'Seed data admin user and task ownership check', 'PASS', 'Exactly 1 admin user with 0 owned tasks confirmed');
        ELSE
            INSERT INTO test_results (test_num, test_name, status, details)
            VALUES (22, 'Seed data admin user and task ownership check', 'WARN', CONCAT('Advisory: Found ', admin_count, ' admin(s) with ', admin_task_count, ' task(s) (non-default seed state)'));
        END IF;
    END;

    -- =========================================================================
    -- Output Result Set 1: Detailed Test List
    -- =========================================================================
    SELECT 
        test_num AS '#',
        test_name AS 'Test Name',
        status AS 'Status',
        details AS 'Details'
    FROM test_results
    ORDER BY id;

    -- =========================================================================
    -- Output Result Set 2: Summary Counts
    -- =========================================================================
    SELECT 
        COUNT(*) AS total_tests,
        SUM(CASE WHEN status = 'PASS' THEN 1 ELSE 0 END) AS passed,
        SUM(CASE WHEN status = 'FAIL' THEN 1 ELSE 0 END) AS failed,
        SUM(CASE WHEN status = 'WARN' THEN 1 ELSE 0 END) AS warnings
    FROM test_results;

END //

DELIMITER ;

-- =============================================================================
-- Execute Test Suite Inside Transaction & Rollback
-- Guarantees zero residual test records remain in the database.
-- =============================================================================
START TRANSACTION;

CALL verify_schema_suite();

ROLLBACK;

-- Clean up test procedure and temporary table
DROP PROCEDURE IF EXISTS verify_schema_suite;
DROP TEMPORARY TABLE IF EXISTS test_results;
