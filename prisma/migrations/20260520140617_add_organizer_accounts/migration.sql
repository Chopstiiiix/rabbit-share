-- AlterTable
ALTER TABLE "Celebration" ADD COLUMN     "organizerId" TEXT;

-- CreateIndex
CREATE INDEX "Celebration_organizerId_idx" ON "Celebration"("organizerId");
