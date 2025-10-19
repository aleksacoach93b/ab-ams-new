-- Fix all database issues
-- Run this in Supabase SQL Editor

-- Check database connection
SELECT NOW() as current_time;

-- Check if all required tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check if ENUM types exist
SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e';

-- Test creating a simple record
INSERT INTO "ReportFolder" (id, name, description, "createdAt", "updatedAt")
VALUES ('test-folder-001', 'Test Folder', 'Test Description', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Check if test record was created
SELECT id, name FROM "ReportFolder" WHERE id = 'test-folder-001';

-- Clean up test record
DELETE FROM "ReportFolder" WHERE id = 'test-folder-001';
