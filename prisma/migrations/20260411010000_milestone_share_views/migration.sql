-- AlterTable
ALTER TABLE "milestone_shares"
  ADD COLUMN "view_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "last_viewed_at" TIMESTAMP(3);
