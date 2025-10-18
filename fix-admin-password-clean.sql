-- Fix admin password - clean approach
-- Run this in Supabase SQL Editor

-- First delete LoginLog entries for admin users
DELETE FROM "LoginLog" WHERE "userId" IN (
    SELECT id FROM "User" WHERE email = 'aleksacoach@gmail.com' OR role = 'ADMIN'
);

-- Then delete admin users
DELETE FROM "User" WHERE email = 'aleksacoach@gmail.com';
DELETE FROM "User" WHERE role = 'ADMIN';

-- Create fresh admin user
INSERT INTO "User" (
    "id", 
    "email", 
    "password", 
    "name", 
    "role", 
    "isActive", 
    "createdAt", 
    "updatedAt"
) VALUES (
    'admin-clean-001',
    'aleksacoach@gmail.com',
    'password123',
    'Admin User',
    'ADMIN',
    true,
    NOW(),
    NOW()
);

-- Check the result
SELECT id, email, password, role, "isActive" FROM "User" WHERE email = 'aleksacoach@gmail.com';
