-- AlterTable
ALTER TABLE "public"."Message" ADD COLUMN     "replyToId" TEXT;

-- CreateIndex
CREATE INDEX "Message_replyToId_idx" ON "public"."Message"("replyToId");

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "public"."Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
