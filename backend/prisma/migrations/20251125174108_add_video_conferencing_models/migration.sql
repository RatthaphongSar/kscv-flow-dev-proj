-- AlterTable
ALTER TABLE "public"."Meeting" ADD COLUMN     "hasTranscription" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recordingDuration" INTEGER,
ADD COLUMN     "recordingStartedAt" TIMESTAMP(3),
ADD COLUMN     "recordingStoppedAt" TIMESTAMP(3),
ADD COLUMN     "recordingUrl" TEXT,
ADD COLUMN     "transcriptionUrl" TEXT;

-- CreateTable
CREATE TABLE "public"."VideoSession" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "recordingUrl" TEXT,
    "recordingSize" INTEGER,
    "duration" INTEGER,
    "meetingId" TEXT NOT NULL,

    CONSTRAINT "VideoSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VideoParticipant" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "videoEnabled" BOOLEAN NOT NULL DEFAULT true,
    "audioEnabled" BOOLEAN NOT NULL DEFAULT true,
    "screenShared" BOOLEAN NOT NULL DEFAULT false,
    "videoQuality" TEXT,
    "audioQuality" TEXT,
    "jitterMs" INTEGER,
    "packetLoss" DOUBLE PRECISION,
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "VideoParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ScreenShareSession" (
    "id" TEXT NOT NULL,
    "presenterId" TEXT NOT NULL,
    "screenUrl" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stoppedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "meetingId" TEXT NOT NULL,

    CONSTRAINT "ScreenShareSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CallStats" (
    "id" TEXT NOT NULL,
    "videoBitrate" INTEGER,
    "videoFramerate" INTEGER,
    "videoResolution" TEXT,
    "audioBitrate" INTEGER,
    "audioLevel" INTEGER,
    "latencyMs" INTEGER,
    "jitterMs" INTEGER,
    "packetLossPercent" DOUBLE PRECISION,
    "bandwidth" INTEGER,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,

    CONSTRAINT "CallStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChatMessage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "senderId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoSession_meetingId_startedAt_idx" ON "public"."VideoSession"("meetingId", "startedAt");

-- CreateIndex
CREATE INDEX "VideoParticipant_sessionId_idx" ON "public"."VideoParticipant"("sessionId");

-- CreateIndex
CREATE INDEX "VideoParticipant_userId_idx" ON "public"."VideoParticipant"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VideoParticipant_sessionId_userId_key" ON "public"."VideoParticipant"("sessionId", "userId");

-- CreateIndex
CREATE INDEX "ScreenShareSession_meetingId_startedAt_idx" ON "public"."ScreenShareSession"("meetingId", "startedAt");

-- CreateIndex
CREATE INDEX "ScreenShareSession_presenterId_idx" ON "public"."ScreenShareSession"("presenterId");

-- CreateIndex
CREATE INDEX "CallStats_sessionId_recordedAt_idx" ON "public"."CallStats"("sessionId", "recordedAt");

-- CreateIndex
CREATE INDEX "CallStats_meetingId_idx" ON "public"."CallStats"("meetingId");

-- CreateIndex
CREATE INDEX "ChatMessage_meetingId_createdAt_idx" ON "public"."ChatMessage"("meetingId", "createdAt");

-- CreateIndex
CREATE INDEX "ChatMessage_senderId_idx" ON "public"."ChatMessage"("senderId");

-- AddForeignKey
ALTER TABLE "public"."VideoSession" ADD CONSTRAINT "VideoSession_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "public"."Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoParticipant" ADD CONSTRAINT "VideoParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VideoParticipant" ADD CONSTRAINT "VideoParticipant_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."VideoSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScreenShareSession" ADD CONSTRAINT "ScreenShareSession_presenterId_fkey" FOREIGN KEY ("presenterId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ScreenShareSession" ADD CONSTRAINT "ScreenShareSession_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "public"."Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CallStats" ADD CONSTRAINT "CallStats_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "public"."VideoSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CallStats" ADD CONSTRAINT "CallStats_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "public"."Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatMessage" ADD CONSTRAINT "ChatMessage_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "public"."Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
