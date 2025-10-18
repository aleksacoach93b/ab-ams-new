-- Fix admin password - create fresh admin user
-- Run this in Supabase SQL Editor

-- Delete existing admin users
DELETE FROM "User" WHERE email = 'aleksacoach@gmail.com';
DELETE FROM "User" WHERE role = 'ADMIN';

-- Create fresh admin user with simple password for testing
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
    'admin-final-001',
    'aleksacoach@gmail.com',
    'password123',  -- Simple password for testing
    'Admin User',
    'ADMIN',
    true,
    NOW(),
    NOW()
);

-- Check the created user
SELECT id, email, password, role, "isActive" FROM "User" WHERE email = 'aleksacoach@gmail.com';
