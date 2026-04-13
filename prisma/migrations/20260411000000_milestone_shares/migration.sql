-- DropColumn
ALTER TABLE "milestones" DROP COLUMN "is_shareable";

-- CreateTable
CREATE TABLE "milestone_shares" (
    "id" UUID NOT NULL,
    "milestone_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "milestone_shares_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "milestone_shares_milestone_id_key" ON "milestone_shares"("milestone_id");

-- CreateIndex
CREATE UNIQUE INDEX "milestone_shares_token_key" ON "milestone_shares"("token");

-- AddForeignKey
ALTER TABLE "milestone_shares" ADD CONSTRAINT "milestone_shares_milestone_id_fkey" FOREIGN KEY ("milestone_id") REFERENCES "milestones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestone_shares" ADD CONSTRAINT "milestone_shares_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
