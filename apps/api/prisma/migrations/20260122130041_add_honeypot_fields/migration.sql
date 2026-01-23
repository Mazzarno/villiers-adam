-- AlterTable
ALTER TABLE "FormSubmission" ADD COLUMN     "honeypot" TEXT,
ADD COLUMN     "isBot" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "FormSubmission_isBot_idx" ON "FormSubmission"("isBot");
