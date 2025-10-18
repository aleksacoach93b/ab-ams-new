-- Fix admin user with proper bcrypt hash
-- Run this in Supabase SQL Editor

-- Delete existing admin user
DELETE FROM "LoginLog" WHERE "userId" IN (
    SELECT id FROM "User" WHERE email = 'aleksacoach@gmail.com'
);
DELETE FROM "User" WHERE email = 'aleksacoach@gmail.com';

-- Create admin user with proper bcrypt hash
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
    'admin-bcrypt-001',
    'aleksacoach@gmail.com',
    '$2b$10$F6YHcNrdl3mPbURXK5tvduge0Yz1U1us526Vee39UhSWaWkCymP/e',
    'Admin User',
    'ADMIN',
    true,
    NOW(),
    NOW()
);

-- Check the result
SELECT id, email, password, role, "isActive" FROM "User" WHERE email = 'aleksacoach@gmail.com';
