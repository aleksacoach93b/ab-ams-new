-- Check existing tables and create missing ones
-- Run this in Supabase SQL Editor

-- Check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Create User table if it doesn't exist
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PLAYER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Player table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Player" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT,
    "status" TEXT NOT NULL DEFAULT 'FULLY_AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- Create Staff table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Staff" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "position" TEXT,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- Create Team table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- Create Event table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "location" TEXT,
    "type" TEXT NOT NULL DEFAULT 'TRAINING',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "allowPlayerCreation" BOOLEAN NOT NULL DEFAULT false,
    "allowPlayerReschedule" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- Create EventParticipant table if it doesn't exist
CREATE TABLE IF NOT EXISTS "EventParticipant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "playerId" TEXT,
    "staffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id")
);

-- Create EventMedia table if it doesn't exist
CREATE TABLE IF NOT EXISTS "EventMedia" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventMedia_pkey" PRIMARY KEY ("id")
);

-- Create PlayerMedia table if it doesn't exist
CREATE TABLE IF NOT EXISTS "PlayerMedia" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerMedia_pkey" PRIMARY KEY ("id")
);

-- Create PlayerNote table if it doesn't exist
CREATE TABLE IF NOT EXISTS "PlayerNote" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlayerNote_pkey" PRIMARY KEY ("id")
);

-- Create ReportFolder table if it doesn't exist
CREATE TABLE IF NOT EXISTS "ReportFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReportFolder_pkey" PRIMARY KEY ("id")
);

-- Create Report table if it doesn't exist
CREATE TABLE IF NOT EXISTS "Report" (
    "id" TEXT NOT NULL,
    "folderId" TEXT,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- Create LoginLog table if it doesn't exist
CREATE TABLE IF NOT EXISTS "LoginLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoginLog_pkey" PRIMARY KEY ("id")
);

-- Create FileAccessLog table if it doesn't exist
CREATE TABLE IF NOT EXISTS "FileAccessLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileId" TEXT,
    "fileName" TEXT,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FileAccessLog_pkey" PRIMARY KEY ("id")
);

-- Create CoachNote table if it doesn't exist
CREATE TABLE IF NOT EXISTS "CoachNote" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CoachNote_pkey" PRIMARY KEY ("id")
);

-- Create CoachNoteStaffAccess table if it doesn't exist
CREATE TABLE IF NOT EXISTS "CoachNoteStaffAccess" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachNoteStaffAccess_pkey" PRIMARY KEY ("id")
);

-- Create ReportVisibility table if it doesn't exist
CREATE TABLE IF NOT EXISTS "ReportVisibility" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportVisibility_pkey" PRIMARY KEY ("id")
);

-- Create ReportFolderVisibility table if it doesn't exist
CREATE TABLE IF NOT EXISTS "ReportFolderVisibility" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportFolderVisibility_pkey" PRIMARY KEY ("id")
);

-- Create ReportStaffAccess table if it doesn't exist
CREATE TABLE IF NOT EXISTS "ReportStaffAccess" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportStaffAccess_pkey" PRIMARY KEY ("id")
);

-- Create ReportFolderStaffAccess table if it doesn't exist
CREATE TABLE IF NOT EXISTS "ReportFolderStaffAccess" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportFolderStaffAccess_pkey" PRIMARY KEY ("id")
);

-- Create indexes if they don't exist
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "Player_userId_key" ON "Player"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "Staff_userId_key" ON "Staff"("userId");

-- Create admin user if it doesn't exist
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

-- Check final result
SELECT 'Tables created successfully! Admin user ready.' as message;
SELECT email, role FROM "User" WHERE email = 'aleksacoach@gmail.com';
