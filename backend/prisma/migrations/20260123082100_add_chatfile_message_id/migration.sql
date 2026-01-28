-- AlterTable
ALTER TABLE "public"."Attendance" ADD COLUMN     "checkinAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "public"."ChatFile" ADD COLUMN     "messageId" TEXT;

-- CreateTable
CREATE TABLE "public"."AssemblyAttendance" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'absent',
    "remark" TEXT,
    "checkinAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "AssemblyAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssemblyAttendance_classId_date_idx" ON "public"."AssemblyAttendance"("classId", "date");

-- CreateIndex
CREATE INDEX "AssemblyAttendance_studentId_idx" ON "public"."AssemblyAttendance"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "AssemblyAttendance_studentId_classId_date_key" ON "public"."AssemblyAttendance"("studentId", "classId", "date");

-- AddForeignKey
ALTER TABLE "public"."AssemblyAttendance" ADD CONSTRAINT "AssemblyAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AssemblyAttendance" ADD CONSTRAINT "AssemblyAttendance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChatFile" ADD CONSTRAINT "ChatFile_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
