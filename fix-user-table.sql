-- Fix User table to match Prisma schema
-- Run this in Supabase SQL Editor

-- Add missing columns to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "loginIp" TEXT,
ADD COLUMN IF NOT EXISTS "userAgent" TEXT;

-- Make password nullable to match Prisma schema
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- Make name nullable to match Prisma schema  
ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL;

-- Check the updated structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'User' 
ORDER BY ordinal_position;
