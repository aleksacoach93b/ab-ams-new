-- Check Event table structure and missing columns
-- Run this in Supabase SQL Editor

-- Check current Event table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'Event' 
ORDER BY ordinal_position;

-- Check if iconName column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Event' AND column_name = 'iconName';

-- Check if isAllDay, isRecurring, allowPlayerCreation, allowPlayerReschedule columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Event' 
AND column_name IN ('isAllDay', 'isRecurring', 'allowPlayerCreation', 'allowPlayerReschedule');
