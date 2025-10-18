-- Create Admin User for AB - AMS
-- Run this in Supabase SQL Editor

-- Create admin user (password: Teodor06022025)
INSERT INTO "User" ("id", "email", "password", "name", "role", "isActive", "createdAt", "updatedAt")
VALUES (
    'admin-001',
    'aleksacoach@gmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: Teodor06022025
    'Admin User',
    'ADMIN',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("email") DO NOTHING;

-- Check if admin user was created
SELECT 'Admin user created successfully!' as message, email, role FROM "User" WHERE email = 'aleksacoach@gmail.com';