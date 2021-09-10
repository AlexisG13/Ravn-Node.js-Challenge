/*
  Warnings:

  - A unique constraint covering the columns `[username]` on the table `UserAuth` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `UserAuth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserAuth" ADD COLUMN     "username" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "UserAuth_username_key" ON "UserAuth"("username");
