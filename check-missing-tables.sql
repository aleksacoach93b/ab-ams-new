-- Check what tables exist and what's missing
-- Run this in Supabase SQL Editor

-- Check all existing tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if EventParticipant table exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'EventParticipant' 
ORDER BY ordinal_position;

-- Check if Event table has all required columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Event' 
ORDER BY ordinal_position;
