-- Test event creation directly in database
-- Run this in Supabase SQL Editor

-- Try to create a test event
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
    "createdAt",
    "updatedAt"
) VALUES (
    'test-event-001',
    'Test Event',
    'This is a test event',
    '2025-01-20 10:00:00',
    '10:00',
    '11:00',
    'Test Location',
    'TRAINING',
    'SCHEDULED',
    false,
    false,
    false,
    false,
    NOW(),
    NOW()
);

-- Check if event was created
SELECT id, title, type, status FROM "Event" WHERE id = 'test-event-001';
