/*
  Warnings:

  - Added the required column `updatedAt` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "replyToId" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'sent',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."Room" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."RoomMember" ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'member';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "passwordHash" TEXT NOT NULL,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE "public"."MessageRead" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageRead_messageId_idx" ON "public"."MessageRead"("messageId");

-- CreateIndex
CREATE INDEX "MessageRead_userId_idx" ON "public"."MessageRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageRead_messageId_userId_key" ON "public"."MessageRead"("messageId", "userId");

-- CreateIndex
CREATE INDEX "Message_userId_idx" ON "public"."Message"("userId");

-- CreateIndex
CREATE INDEX "Message_type_idx" ON "public"."Message"("type");

-- CreateIndex
CREATE INDEX "Room_type_idx" ON "public"."Room"("type");

-- CreateIndex
CREATE INDEX "Room_isActive_idx" ON "public"."Room"("isActive");

-- CreateIndex
CREATE INDEX "RoomMember_role_idx" ON "public"."RoomMember"("role");

-- AddForeignKey
ALTER TABLE "public"."MessageRead" ADD CONSTRAINT "MessageRead_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MessageRead" ADD CONSTRAINT "MessageRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "public"."Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
