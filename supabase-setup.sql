-- AB - AMS Database Setup
-- Run this in Supabase SQL Editor

-- Create ENUM types
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'COACH', 'PLAYER', 'STAFF');
CREATE TYPE "PlayerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'INJURED', 'SUSPENDED');
CREATE TYPE "EventType" AS ENUM ('TRAINING', 'MATCH', 'MEETING', 'MEDICAL', 'RECOVERY', 'MEAL', 'REST');
CREATE TYPE "EventStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'PLAYER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    "loginIp" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Player table
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

-- Create Staff table
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" TEXT,
    "permissions" TEXT[],
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- Create Team table
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- Create Event table
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
    "iconName" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- Create EventParticipant table
CREATE TABLE "EventParticipant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "playerId" TEXT,
    "staffId" TEXT,
    "participantType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id")
);

-- Create EventMedia table
CREATE TABLE "EventMedia" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventMedia_pkey" PRIMARY KEY ("id")
);

-- Create PlayerMedia table
CREATE TABLE "PlayerMedia" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlayerMedia_pkey" PRIMARY KEY ("id")
);

-- Create ReportFolder table
CREATE TABLE "ReportFolder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "createdBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportFolder_pkey" PRIMARY KEY ("id")
);

-- Create Report table
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "folderId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- Create CoachNote table
CREATE TABLE "CoachNote" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachNote_pkey" PRIMARY KEY ("id")
);

-- Create CoachNoteStaffAccess table
CREATE TABLE "CoachNoteStaffAccess" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CoachNoteStaffAccess_pkey" PRIMARY KEY ("id")
);

-- Create PlayerNote table
CREATE TABLE "PlayerNote" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerNote_pkey" PRIMARY KEY ("id")
);

-- Create LoginLog table
CREATE TABLE "LoginLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginLog_pkey" PRIMARY KEY ("id")
);

-- Create FileAccessLog table
CREATE TABLE "FileAccessLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileAccessLog_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Create foreign key constraints
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Player" ADD CONSTRAINT "Player_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Staff" ADD CONSTRAINT "Staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventMedia" ADD CONSTRAINT "EventMedia_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerMedia" ADD CONSTRAINT "PlayerMedia_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ReportFolder" ADD CONSTRAINT "ReportFolder_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ReportFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ReportFolder" ADD CONSTRAINT "ReportFolder_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "ReportFolder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CoachNote" ADD CONSTRAINT "CoachNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CoachNoteStaffAccess" ADD CONSTRAINT "CoachNoteStaffAccess_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "CoachNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CoachNoteStaffAccess" ADD CONSTRAINT "CoachNoteStaffAccess_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerNote" ADD CONSTRAINT "PlayerNote_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerNote" ADD CONSTRAINT "PlayerNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "LoginLog" ADD CONSTRAINT "LoginLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FileAccessLog" ADD CONSTRAINT "FileAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create admin user
INSERT INTO "User" ("id", "email", "password", "name", "role", "isActive", "updatedAt") 
VALUES ('admin-001', 'aleksacoach@gmail.com', 'Teodor2025', 'Admin User', 'ADMIN', true, CURRENT_TIMESTAMP);

-- Create test player
INSERT INTO "User" ("id", "email", "password", "name", "role", "isActive", "updatedAt") 
VALUES ('player-001', 'player@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test Player', 'PLAYER', true, CURRENT_TIMESTAMP);

INSERT INTO "Player" ("id", "name", "email", "position", "userId", "updatedAt") 
VALUES ('player-001', 'Test Player', 'player@test.com', 'Forward', 'player-001', CURRENT_TIMESTAMP);

-- Create test staff
INSERT INTO "User" ("id", "email", "password", "name", "role", "isActive", "updatedAt") 
VALUES ('staff-001', 'staff@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test Staff', 'STAFF', true, CURRENT_TIMESTAMP);

INSERT INTO "Staff" ("id", "name", "email", "position", "permissions", "userId", "updatedAt") 
VALUES ('staff-001', 'Test Staff', 'staff@test.com', 'Assistant Coach', ARRAY['view_players', 'view_events'], 'staff-001', CURRENT_TIMESTAMP);

-- Create test team
INSERT INTO "Team" ("id", "name", "description", "updatedAt") 
VALUES ('team-001', 'Main Team', 'Primary team for all players', CURRENT_TIMESTAMP);

-- Create test event
INSERT INTO "Event" ("id", "title", "description", "date", "startTime", "endTime", "type", "iconName", "updatedAt") 
VALUES ('event-001', 'Training Session', 'Regular training session', '2025-01-20 10:00:00', '10:00', '12:00', 'TRAINING', 'dumbbell-realistic', CURRENT_TIMESTAMP);

-- Create test report folder
INSERT INTO "ReportFolder" ("id", "name", "description", "createdBy", "updatedAt") 
VALUES ('folder-001', 'Training Reports', 'Reports from training sessions', 'admin-001', CURRENT_TIMESTAMP);

-- Create test coach note
INSERT INTO "CoachNote" ("id", "title", "content", "authorId", "updatedAt") 
VALUES ('note-001', 'Team Meeting Notes', 'Important points from team meeting', 'admin-001', CURRENT_TIMESTAMP);

-- Success message
SELECT 'Database setup completed successfully!' as message;
