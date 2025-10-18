-- Fix table names to match Prisma schema
-- Run this in Supabase SQL Editor

-- Check current table names
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Drop existing tables if they exist with wrong names
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS "player" CASCADE;
DROP TABLE IF EXISTS "staff" CASCADE;
DROP TABLE IF EXISTS "team" CASCADE;
DROP TABLE IF EXISTS "event" CASCADE;
DROP TABLE IF EXISTS "eventparticipant" CASCADE;
DROP TABLE IF EXISTS "eventmedia" CASCADE;
DROP TABLE IF EXISTS "playermedia" CASCADE;
DROP TABLE IF EXISTS "playernote" CASCADE;
DROP TABLE IF EXISTS "reportfolder" CASCADE;
DROP TABLE IF EXISTS "report" CASCADE;
DROP TABLE IF EXISTS "loginlog" CASCADE;
DROP TABLE IF EXISTS "fileaccesslog" CASCADE;
DROP TABLE IF EXISTS "coachnote" CASCADE;
DROP TABLE IF EXISTS "coachnotestaffaccess" CASCADE;
DROP TABLE IF EXISTS "reportvisibility" CASCADE;
DROP TABLE IF EXISTS "reportfoldervisibility" CASCADE;
DROP TABLE IF EXISTS "reportstaffaccess" CASCADE;
DROP TABLE IF EXISTS "reportfolderstaffaccess" CASCADE;

-- Create User table with correct name
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PLAYER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "loginIp" TEXT,
    "userAgent" TEXT,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Player table with correct name
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

-- Create Staff table with correct name
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "department" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- Create Team table with correct name
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- Create Event table with correct name
CREATE TABLE "Event" (
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

-- Create EventParticipant table with correct name
CREATE TABLE "EventParticipant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "playerId" TEXT,
    "staffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id")
);

-- Create EventMedia table with correct name
CREATE TABLE "EventMedia" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EventMedia_pkey" PRIMARY KEY ("id")
);

-- Create PlayerMedia table with correct name
CREATE TABLE "PlayerMedia" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerMedia_pkey" PRIMARY KEY ("id")
);

-- Create PlayerNote table with correct name
CREATE TABLE "PlayerNote" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PlayerNote_pkey" PRIMARY KEY ("id")
);

-- Create ReportFolder table with correct name
CREATE TABLE "ReportFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ReportFolder_pkey" PRIMARY KEY ("id")
);

-- Create Report table with correct name
CREATE TABLE "Report" (
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

-- Create LoginLog table with correct name
CREATE TABLE "LoginLog" (
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

-- Create FileAccessLog table with correct name
CREATE TABLE "FileAccessLog" (
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

-- Create CoachNote table with correct name
CREATE TABLE "CoachNote" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CoachNote_pkey" PRIMARY KEY ("id")
);

-- Create CoachNoteStaffAccess table with correct name
CREATE TABLE "CoachNoteStaffAccess" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CoachNoteStaffAccess_pkey" PRIMARY KEY ("id")
);

-- Create ReportVisibility table with correct name
CREATE TABLE "ReportVisibility" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportVisibility_pkey" PRIMARY KEY ("id")
);

-- Create ReportFolderVisibility table with correct name
CREATE TABLE "ReportFolderVisibility" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportFolderVisibility_pkey" PRIMARY KEY ("id")
);

-- Create ReportStaffAccess table with correct name
CREATE TABLE "ReportStaffAccess" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportStaffAccess_pkey" PRIMARY KEY ("id")
);

-- Create ReportFolderStaffAccess table with correct name
CREATE TABLE "ReportFolderStaffAccess" (
    "id" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportFolderStaffAccess_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Player_userId_key" ON "Player"("userId");
CREATE UNIQUE INDEX "Staff_userId_key" ON "Staff"("userId");

-- Create admin user
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

-- Success message
SELECT 'Tables created with correct names! Admin user ready.' as message;
SELECT email, role FROM "User" WHERE email = 'aleksacoach@gmail.com';
