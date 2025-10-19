-- Debug events API issue
-- Run this in Supabase SQL Editor to test event creation

-- Test if we can create an event directly
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
    'debug-event-001',
    'Debug Test Event',
    'Testing event creation',
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

-- Check if event was created
SELECT id, title, type, "startTime", "endTime", "iconName" FROM "Event" WHERE id = 'debug-event-001';

-- Check if there are any issues with the Event table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'Event' 
ORDER BY ordinal_position;
