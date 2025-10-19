-- Test database connection directly
-- Run this in Supabase SQL Editor

-- Check if database is accessible
SELECT NOW() as current_time;

-- Check if we can access Event table
SELECT COUNT(*) as event_count FROM "Event";

-- Check if we can create a simple test record
INSERT INTO "Event" (
    "id",
    "title", 
    "description",
    "date",
    "startTime",
    "endTime",
    "location",
    "type",
    "status",
    "isAllDay",
    "isRecurring",
    "allowPlayerCreation",
    "allowPlayerReschedule",
    "iconName",
    "createdAt",
    "updatedAt"
) VALUES (
    'test-connection-001',
    'Connection Test',
    'Testing database connection',
    '2025-01-20 11:11:00',
    '11:11',
    '12:12',
    'Test Location',
    'TRAINING',
    'SCHEDULED',
    false,
    false,
    false,
    false,
    'dumbbell-realistic',
    NOW(),
    NOW()
);

-- Check if test record was created
SELECT id, title FROM "Event" WHERE id = 'test-connection-001';

-- Clean up test record
DELETE FROM "Event" WHERE id = 'test-connection-001';
