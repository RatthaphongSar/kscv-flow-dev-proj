-- ============================================================
-- KVC WebApp Database Schema (PostgreSQL)
-- Generated from Prisma Schema
-- ============================================================

-- Core Tables

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "username" TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT,
  "email" TEXT UNIQUE,
  "phone" TEXT,
  "role" TEXT NOT NULL DEFAULT 'STUDENT',
  "year" INTEGER NOT NULL DEFAULT 1,
  "major" TEXT NOT NULL DEFAULT 'General',
  "fullname" TEXT,
  "studentId" TEXT,
  "address" TEXT,
  "avatar" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "User_role_year_major_idx" ON "User"("role", "year", "major");

-- ============================================================
-- CHAT MODELS
-- ============================================================

CREATE TABLE "Room" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "type" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "RoomMember" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "roomId" TEXT NOT NULL REFERENCES "Room"("id"),
  UNIQUE("roomId", "userId")
);

CREATE INDEX "RoomMember_userId_idx" ON "RoomMember"("userId");
CREATE INDEX "RoomMember_roomId_idx" ON "RoomMember"("roomId");

CREATE TABLE "Message" (
  "id" TEXT PRIMARY KEY,
  "content" TEXT,
  "type" TEXT NOT NULL DEFAULT 'text',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "edited" BOOLEAN NOT NULL DEFAULT false,
  "editedAt" TIMESTAMP,
  "deletedForEveryone" BOOLEAN NOT NULL DEFAULT false,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "roomId" TEXT NOT NULL REFERENCES "Room"("id") ON DELETE CASCADE,
  "replyToId" TEXT REFERENCES "Message"("id") ON DELETE CASCADE,
  "fileId" TEXT UNIQUE
);

CREATE INDEX "Message_roomId_createdAt_idx" ON "Message"("roomId", "createdAt");
CREATE INDEX "Message_replyToId_idx" ON "Message"("replyToId");
CREATE INDEX "Message_userId_idx" ON "Message"("userId");

CREATE TABLE "DeletedMessagePerUser" (
  "id" TEXT PRIMARY KEY,
  "messageId" TEXT NOT NULL REFERENCES "Message"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "deletedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("messageId", "userId")
);

CREATE INDEX "DeletedMessagePerUser_userId_idx" ON "DeletedMessagePerUser"("userId");
CREATE INDEX "DeletedMessagePerUser_messageId_idx" ON "DeletedMessagePerUser"("messageId");

CREATE TABLE "PinnedMessage" (
  "id" TEXT PRIMARY KEY,
  "messageId" TEXT NOT NULL REFERENCES "Message"("id") ON DELETE CASCADE,
  "roomId" TEXT NOT NULL REFERENCES "Room"("id") ON DELETE CASCADE,
  "pinnedBy" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "pinnedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("messageId", "roomId")
);

CREATE INDEX "PinnedMessage_roomId_pinnedAt_idx" ON "PinnedMessage"("roomId", "pinnedAt");
CREATE INDEX "PinnedMessage_pinnedBy_idx" ON "PinnedMessage"("pinnedBy");

CREATE TABLE "ChatNote" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "roomId" TEXT NOT NULL REFERENCES "Room"("id") ON DELETE CASCADE,
  "authorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "ChatNote_roomId_updatedAt_idx" ON "ChatNote"("roomId", "updatedAt");
CREATE INDEX "ChatNote_authorId_idx" ON "ChatNote"("authorId");

CREATE TABLE "ChatFile" (
  "id" TEXT PRIMARY KEY,
  "fileName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "url" TEXT NOT NULL,
  "width" INTEGER,
  "height" INTEGER,
  "roomId" TEXT NOT NULL REFERENCES "Room"("id") ON DELETE CASCADE,
  "uploaderId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "messageId" TEXT REFERENCES "Message"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "ChatFile_roomId_createdAt_idx" ON "ChatFile"("roomId", "createdAt");
CREATE INDEX "ChatFile_uploaderId_idx" ON "ChatFile"("uploaderId");

CREATE TABLE "RoomPin" (
  "id" TEXT PRIMARY KEY,
  "roomId" TEXT NOT NULL REFERENCES "Room"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "pinnedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("roomId", "userId")
);

CREATE INDEX "RoomPin_userId_pinnedAt_idx" ON "RoomPin"("userId", "pinnedAt");
CREATE INDEX "RoomPin_roomId_idx" ON "RoomPin"("roomId");

CREATE TABLE "MessageRead" (
  "id" TEXT PRIMARY KEY,
  "messageId" TEXT NOT NULL REFERENCES "Message"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "readAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("messageId", "userId")
);

CREATE INDEX "MessageRead_userId_readAt_idx" ON "MessageRead"("userId", "readAt");

-- ============================================================
-- ACADEMIC MODELS
-- ============================================================

CREATE TABLE "Class" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "section" TEXT NOT NULL DEFAULT '1',
  "credits" INTEGER NOT NULL DEFAULT 3,
  "semester" TEXT,
  "academicYear" INTEGER,
  "room" TEXT,
  "capacity" INTEGER,
  "teacherId" TEXT NOT NULL REFERENCES "User"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("code", "section", "semester")
);

CREATE INDEX "Class_teacherId_idx" ON "Class"("teacherId");
CREATE INDEX "Class_code_idx" ON "Class"("code");
CREATE INDEX "Class_semester_idx" ON "Class"("semester");

CREATE TABLE "Enrollment" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "enrolledAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "status" TEXT NOT NULL DEFAULT 'active',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("classId", "studentId")
);

CREATE INDEX "Enrollment_studentId_idx" ON "Enrollment"("studentId");
CREATE INDEX "Enrollment_classId_idx" ON "Enrollment"("classId");

CREATE TABLE "JoinRequest" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "reason" TEXT,
  "respondedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("classId", "studentId")
);

CREATE INDEX "JoinRequest_studentId_idx" ON "JoinRequest"("studentId");
CREATE INDEX "JoinRequest_classId_status_idx" ON "JoinRequest"("classId", "status");

CREATE TABLE "Assignment" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "assignmentType" TEXT NOT NULL DEFAULT 'homework',
  "maxScore" FLOAT NOT NULL DEFAULT 100,
  "assignedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "dueDate" TIMESTAMP NOT NULL,
  "requiredFilesCount" INTEGER NOT NULL DEFAULT 1,
  "maxSubmissionCount" INTEGER NOT NULL DEFAULT 1,
  "teacherId" TEXT NOT NULL REFERENCES "User"("id"),
  "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "Assignment_classId_dueDate_idx" ON "Assignment"("classId", "dueDate");
CREATE INDEX "Assignment_classId_assignedAt_idx" ON "Assignment"("classId", "assignedAt");
CREATE INDEX "Assignment_teacherId_idx" ON "Assignment"("teacherId");

CREATE TABLE "AssignmentSubmission" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "assignmentId" TEXT NOT NULL REFERENCES "Assignment"("id") ON DELETE CASCADE,
  "submittedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "fileUrl" TEXT,
  "content" TEXT,
  "grade" FLOAT,
  "feedback" TEXT,
  "status" TEXT NOT NULL DEFAULT 'not_submitted',
  "submissionCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("assignmentId", "studentId")
);

CREATE INDEX "AssignmentSubmission_studentId_submittedAt_idx" ON "AssignmentSubmission"("studentId", "submittedAt");
CREATE INDEX "AssignmentSubmission_status_idx" ON "AssignmentSubmission"("status");

CREATE TABLE "Attendance" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "sessionId" TEXT REFERENCES "AttendanceSession"("id") ON DELETE SET NULL,
  "date" TIMESTAMP NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'absent',
  "remark" TEXT,
  "checkinAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("studentId", "classId", "date")
);

CREATE INDEX "Attendance_classId_date_idx" ON "Attendance"("classId", "date");
CREATE INDEX "Attendance_studentId_idx" ON "Attendance"("studentId");
CREATE INDEX "Attendance_sessionId_idx" ON "Attendance"("sessionId");

CREATE TABLE "AttendanceSession" (
  "id" TEXT PRIMARY KEY,
  "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "subject" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'active',
  "description" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "AttendanceSession_classId_idx" ON "AttendanceSession"("classId");
CREATE INDEX "AttendanceSession_startDate_idx" ON "AttendanceSession"("startDate");

CREATE TABLE "AssemblyAttendance" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "date" TIMESTAMP NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'absent',
  "remark" TEXT,
  "checkinAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("studentId", "classId", "date")
);

CREATE INDEX "AssemblyAttendance_classId_date_idx" ON "AssemblyAttendance"("classId", "date");
CREATE INDEX "AssemblyAttendance_studentId_idx" ON "AssemblyAttendance"("studentId");

CREATE TABLE "Exam" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "date" TIMESTAMP NOT NULL,
  "room" TEXT,
  "duration" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "Exam_classId_date_idx" ON "Exam"("classId", "date");

CREATE TABLE "Grade" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "examId" TEXT NOT NULL REFERENCES "Exam"("id") ON DELETE CASCADE,
  "score" FLOAT NOT NULL,
  "maxScore" FLOAT NOT NULL DEFAULT 100,
  "percentage" FLOAT,
  "grade" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("examId", "studentId")
);

CREATE INDEX "Grade_studentId_score_idx" ON "Grade"("studentId", "score");

CREATE TABLE "GradeItem" (
  "id" TEXT PRIMARY KEY,
  "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "itemType" TEXT NOT NULL DEFAULT 'assignment',
  "maxScore" FLOAT NOT NULL DEFAULT 100,
  "weight" FLOAT NOT NULL DEFAULT 0.1,
  "description" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "GradeItem_classId_idx" ON "GradeItem"("classId");

CREATE TABLE "GradeRecord" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "gradeItemId" TEXT NOT NULL REFERENCES "GradeItem"("id") ON DELETE CASCADE,
  "score" FLOAT NOT NULL,
  "percentage" FLOAT,
  "grade" TEXT,
  "feedback" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("gradeItemId", "studentId")
);

CREATE INDEX "GradeRecord_studentId_idx" ON "GradeRecord"("studentId");
CREATE INDEX "GradeRecord_gradeItemId_idx" ON "GradeRecord"("gradeItemId");

CREATE TABLE "Leave" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL REFERENCES "User"("id"),
  "advisorId" TEXT REFERENCES "User"("id"),
  "type" TEXT NOT NULL,
  "startDate" TIMESTAMP NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "reason" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "docUrl" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "Leave_studentId_status_idx" ON "Leave"("studentId", "status");

CREATE TABLE "Schedule" (
  "id" TEXT PRIMARY KEY,
  "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "room" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("classId", "dayOfWeek", "startTime")
);

-- ============================================================
-- MEETING & VIDEO CONFERENCING
-- ============================================================

CREATE TABLE "Meeting" (
  "id" TEXT PRIMARY KEY,
  "teacherId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL DEFAULT 'online',
  "platform" TEXT,
  "location" TEXT,
  "startTime" TIMESTAMP NOT NULL,
  "endTime" TIMESTAMP NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'scheduled',
  "capacity" INTEGER,
  "recordingStartedAt" TIMESTAMP,
  "recordingStoppedAt" TIMESTAMP,
  "recordingUrl" TEXT,
  "recordingDuration" INTEGER,
  "hasTranscription" BOOLEAN NOT NULL DEFAULT false,
  "transcriptionUrl" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "Meeting_classId_startTime_idx" ON "Meeting"("classId", "startTime");
CREATE INDEX "Meeting_teacherId_startTime_idx" ON "Meeting"("teacherId", "startTime");
CREATE INDEX "Meeting_status_idx" ON "Meeting"("status");

CREATE TABLE "MeetingParticipant" (
  "id" TEXT PRIMARY KEY,
  "meetingId" TEXT NOT NULL REFERENCES "Meeting"("id") ON DELETE CASCADE,
  "studentId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL DEFAULT 'joined',
  "joinedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "leftAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("meetingId", "studentId")
);

CREATE INDEX "MeetingParticipant_meetingId_idx" ON "MeetingParticipant"("meetingId");
CREATE INDEX "MeetingParticipant_studentId_idx" ON "MeetingParticipant"("studentId");

CREATE TABLE "VideoSession" (
  "id" TEXT PRIMARY KEY,
  "meetingId" TEXT NOT NULL REFERENCES "Meeting"("id") ON DELETE CASCADE,
  "status" TEXT NOT NULL DEFAULT 'active',
  "startedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "endedAt" TIMESTAMP,
  "recordingUrl" TEXT,
  "recordingSize" INTEGER,
  "duration" INTEGER
);

CREATE INDEX "VideoSession_meetingId_startedAt_idx" ON "VideoSession"("meetingId", "startedAt");

CREATE TABLE "VideoParticipant" (
  "id" TEXT PRIMARY KEY,
  "sessionId" TEXT NOT NULL REFERENCES "VideoSession"("id") ON DELETE CASCADE,
  "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "joinedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "leftAt" TIMESTAMP,
  "videoEnabled" BOOLEAN NOT NULL DEFAULT true,
  "audioEnabled" BOOLEAN NOT NULL DEFAULT true,
  "screenShared" BOOLEAN NOT NULL DEFAULT false,
  "videoQuality" TEXT,
  "audioQuality" TEXT,
  "jitterMs" INTEGER,
  "packetLoss" FLOAT,
  UNIQUE("sessionId", "userId")
);

CREATE INDEX "VideoParticipant_sessionId_idx" ON "VideoParticipant"("sessionId");
CREATE INDEX "VideoParticipant_userId_idx" ON "VideoParticipant"("userId");

CREATE TABLE "ScreenShareSession" (
  "id" TEXT PRIMARY KEY,
  "meetingId" TEXT NOT NULL REFERENCES "Meeting"("id") ON DELETE CASCADE,
  "presenterId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "screenUrl" TEXT,
  "startedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "stoppedAt" TIMESTAMP,
  "duration" INTEGER
);

CREATE INDEX "ScreenShareSession_meetingId_startedAt_idx" ON "ScreenShareSession"("meetingId", "startedAt");
CREATE INDEX "ScreenShareSession_presenterId_idx" ON "ScreenShareSession"("presenterId");

CREATE TABLE "CallStats" (
  "id" TEXT PRIMARY KEY,
  "sessionId" TEXT NOT NULL REFERENCES "VideoSession"("id") ON DELETE CASCADE,
  "meetingId" TEXT NOT NULL REFERENCES "Meeting"("id") ON DELETE CASCADE,
  "videoBitrate" INTEGER,
  "videoFramerate" INTEGER,
  "videoResolution" TEXT,
  "audioBitrate" INTEGER,
  "audioLevel" INTEGER,
  "latencyMs" INTEGER,
  "jitterMs" INTEGER,
  "packetLossPercent" FLOAT,
  "bandwidth" INTEGER,
  "recordedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "CallStats_sessionId_recordedAt_idx" ON "CallStats"("sessionId", "recordedAt");
CREATE INDEX "CallStats_meetingId_idx" ON "CallStats"("meetingId");

CREATE TABLE "ChatMessage" (
  "id" TEXT PRIMARY KEY,
  "meetingId" TEXT NOT NULL REFERENCES "Meeting"("id") ON DELETE CASCADE,
  "senderId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "ChatMessage_meetingId_createdAt_idx" ON "ChatMessage"("meetingId", "createdAt");
CREATE INDEX "ChatMessage_senderId_idx" ON "ChatMessage"("senderId");

-- ============================================================
-- CLUBS & ORGANIZATIONS
-- ============================================================

CREATE TABLE "Club" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "Club_name_idx" ON "Club"("name");

CREATE TABLE "ClubMember" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "clubId" TEXT NOT NULL REFERENCES "Club"("id"),
  "role" TEXT NOT NULL DEFAULT 'member',
  UNIQUE("clubId", "userId")
);

CREATE INDEX "ClubMember_userId_idx" ON "ClubMember"("userId");

CREATE TABLE "ClubActivity" (
  "id" TEXT PRIMARY KEY,
  "clubId" TEXT NOT NULL REFERENCES "Club"("id"),
  "title" TEXT NOT NULL,
  "description" TEXT,
  "date" TIMESTAMP NOT NULL,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "ClubActivity_clubId_date_idx" ON "ClubActivity"("clubId", "date");

CREATE TABLE "Community" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "Community_name_idx" ON "Community"("name");

CREATE TABLE "CommunityMember" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "communityId" TEXT NOT NULL REFERENCES "Community"("id"),
  "role" TEXT NOT NULL DEFAULT 'member',
  UNIQUE("communityId", "userId")
);

CREATE INDEX "CommunityMember_userId_idx" ON "CommunityMember"("userId");

CREATE TABLE "Organization" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "Organization_name_idx" ON "Organization"("name");

CREATE TABLE "ClassOrganization" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "User"("id"),
  "organizationId" TEXT NOT NULL REFERENCES "Organization"("id"),
  "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "position" TEXT NOT NULL,
  UNIQUE("organizationId", "classId", "userId")
);

CREATE INDEX "ClassOrganization_classId_organizationId_idx" ON "ClassOrganization"("classId", "organizationId");

-- ============================================================
-- MISCELLANEOUS
-- ============================================================

CREATE TABLE "Advisor" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL REFERENCES "User"("id"),
  "email" TEXT UNIQUE NOT NULL,
  "phone" TEXT,
  "office" TEXT,
  "bio" TEXT,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "Advisor_email_idx" ON "Advisor"("email");

CREATE TABLE "RegisterService" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'online',
  "eta" TEXT,
  "fee" FLOAT NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "RegisterService_category_status_idx" ON "RegisterService"("category", "status");

CREATE TABLE "ServiceRequest" (
  "id" TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL REFERENCES "User"("id"),
  "serviceId" TEXT NOT NULL REFERENCES "RegisterService"("id"),
  "status" TEXT NOT NULL DEFAULT 'pending',
  "appliedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "completedAt" TIMESTAMP,
  "remarks" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("serviceId", "studentId")
);

CREATE INDEX "ServiceRequest_studentId_status_idx" ON "ServiceRequest"("studentId", "status");

CREATE TABLE "Resource" (
  "id" TEXT PRIMARY KEY,
  "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "fileUrl" TEXT NOT NULL,
  "fileType" TEXT NOT NULL,
  "size" INTEGER,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "Resource_classId_fileType_idx" ON "Resource"("classId", "fileType");

CREATE TABLE "Announcement" (
  "id" TEXT PRIMARY KEY,
  "authorId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'ประกาศ',
  "image" TEXT,
  "excerpt" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "Announcement_classId_createdAt_idx" ON "Announcement"("classId", "createdAt");
CREATE INDEX "Announcement_authorId_idx" ON "Announcement"("authorId");

CREATE TABLE "TeachingMaterial" (
  "id" TEXT PRIMARY KEY,
  "classId" TEXT NOT NULL REFERENCES "Class"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL,
  "fileUrl" TEXT,
  "linkUrl" TEXT,
  "fileType" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "TeachingMaterial_classId_createdAt_idx" ON "TeachingMaterial"("classId", "createdAt");

-- ============================================================
-- END OF SCHEMA
-- ============================================================
