/*
  Warnings:

  - You are about to drop the column `type` on the `Reaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Reaction" DROP COLUMN "type";

-- CreateTable
CREATE TABLE "ReactionReference" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ReactionReference_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_resourceType_fkey" FOREIGN KEY ("resourceType") REFERENCES "ReactionReference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
