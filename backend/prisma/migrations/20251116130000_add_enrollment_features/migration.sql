-- CreateEnum
CREATE TYPE "JoinRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "JoinRequest" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "JoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingMaterial" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "fileUrl" TEXT,
    "linkUrl" TEXT,
    "fileType" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "TeachingMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JoinRequest_classId_studentId_key" ON "JoinRequest"("classId", "studentId");

-- CreateIndex
CREATE INDEX "JoinRequest_studentId_idx" ON "JoinRequest"("studentId");

-- CreateIndex
CREATE INDEX "JoinRequest_classId_status_idx" ON "JoinRequest"("classId", "status");

-- CreateIndex
CREATE INDEX "TeachingMaterial_classId_createdAt_idx" ON "TeachingMaterial"("classId", "createdAt");

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JoinRequest" ADD CONSTRAINT "JoinRequest_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingMaterial" ADD CONSTRAINT "TeachingMaterial_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable Assignment: Add new fields
ALTER TABLE "Assignment" ADD COLUMN "requiredFilesCount" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Assignment" ADD COLUMN "maxSubmissionCount" INTEGER NOT NULL DEFAULT 1;

-- AlterTable AssignmentSubmission: Add new fields
ALTER TABLE "AssignmentSubmission" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'not_submitted';
ALTER TABLE "AssignmentSubmission" ADD COLUMN "submissionCount" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex for AssignmentSubmission status
CREATE INDEX "AssignmentSubmission_status_idx" ON "AssignmentSubmission"("status");
