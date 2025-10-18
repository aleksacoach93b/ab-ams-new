-- Create ALL ENUM types for Prisma schema
-- Run this in Supabase SQL Editor

-- Drop existing enums if they exist (to avoid conflicts)
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "PlayerStatus" CASCADE;
DROP TYPE IF EXISTS "EventType" CASCADE;
DROP TYPE IF EXISTS "EventStatus" CASCADE;

-- Create UserRole enum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COACH', 'STAFF', 'PLAYER');

-- Create PlayerStatus enum
CREATE TYPE "PlayerStatus" AS ENUM ('ACTIVE', 'INJURED', 'SUSPENDED', 'INACTIVE');

-- Create EventType enum
CREATE TYPE "EventType" AS ENUM ('TRAINING', 'MATCH', 'MEETING', 'RECOVERY', 'MEAL', 'REST');

-- Create EventStatus enum
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Check if enums were created successfully
SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e' ORDER BY typname;
