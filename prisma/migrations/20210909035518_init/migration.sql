/*
  Warnings:

  - Added the required column `isVerified` to the `UserAuth` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserAuth" ADD COLUMN     "isVerified" BOOLEAN NOT NULL;

-- RenameIndex
ALTER INDEX "UserAuth_userId_unique" RENAME TO "UserAuth_userId_key";
