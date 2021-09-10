/*
  Warnings:

  - A unique constraint covering the columns `[resourceId,userId]` on the table `Reaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Reaction_resourceId_userId_key" ON "Reaction"("resourceId", "userId");

-- RenameIndex
ALTER INDEX "UserSettings_userId_unique" RENAME TO "UserSettings_userId_key";
