-- Create all ENUM types for Prisma schema
-- Run this in Supabase SQL Editor

-- Create UserRole enum
DO $$ BEGIN
    CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COACH', 'STAFF', 'PLAYER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create PlayerStatus enum
DO $$ BEGIN
    CREATE TYPE "PlayerStatus" AS ENUM ('ACTIVE', 'INJURED', 'SUSPENDED', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create EventType enum
DO $$ BEGIN
    CREATE TYPE "EventType" AS ENUM ('TRAINING', 'MATCH', 'MEETING', 'RECOVERY', 'MEAL', 'REST');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create EventStatus enum
DO $$ BEGIN
    CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Check if enums were created
SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND typtype = 'e';
