-- Fix Player table to match Prisma schema
-- Run this in Supabase SQL Editor

-- Drop and recreate Player table with correct structure
DROP TABLE IF EXISTS "Player" CASCADE;

CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "jerseyNumber" INTEGER,
    "dateOfBirth" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "userId" TEXT,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "availabilityStatus" TEXT NOT NULL DEFAULT 'Fully Available',
    "imageUrl" TEXT,
    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- Create unique index for userId
CREATE UNIQUE INDEX "Player_userId_key" ON "Player"("userId");

-- Check the updated structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Player' 
ORDER BY ordinal_position;
