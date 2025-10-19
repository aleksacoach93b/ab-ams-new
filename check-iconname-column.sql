-- Check if iconName column exists in Event table
-- Run this in Supabase SQL Editor

-- Check if iconName column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Event' AND column_name = 'iconName';

-- If it doesn't exist, add it
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "iconName" TEXT;

-- Check the result
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Event' AND column_name = 'iconName';
