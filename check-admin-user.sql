-- Check admin user in database
-- Run this in Supabase SQL Editor

-- Check if admin user exists
SELECT id, email, role, "isActive", "lastLoginAt" FROM "User" WHERE email = 'aleksacoach@gmail.com';

-- Check if password is set
SELECT id, email, password IS NOT NULL as has_password FROM "User" WHERE email = 'aleksacoach@gmail.com';

-- Test password verification
SELECT id, email, 
       CASE 
         WHEN password = 'password123' THEN 'Plain text password'
         WHEN password LIKE '$2%' THEN 'Bcrypt hash'
         ELSE 'Unknown format'
       END as password_type
FROM "User" WHERE email = 'aleksacoach@gmail.com';

-- Check LoginLog table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'LoginLog' 
ORDER BY ordinal_position;
