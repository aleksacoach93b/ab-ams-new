-- Check what tables already exist
-- Run this in Supabase SQL Editor

-- Check current table names
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check User table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'User' 
ORDER BY ordinal_position;

-- Check if admin user exists
SELECT email, role FROM "User" WHERE email = 'aleksacoach@gmail.com';
