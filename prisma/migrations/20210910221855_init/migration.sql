/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `ReactionReference` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ReactionReference_name_key" ON "ReactionReference"("name");
