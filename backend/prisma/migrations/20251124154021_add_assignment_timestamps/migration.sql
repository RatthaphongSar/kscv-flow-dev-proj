-- AlterTable
ALTER TABLE "public"."Assignment" ADD COLUMN     "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Assignment_classId_assignedAt_idx" ON "public"."Assignment"("classId", "assignedAt");
