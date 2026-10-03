/*
  Warnings:

  - You are about to drop the column `isPinned` on the `announcement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "announcement" DROP COLUMN "isPinned",
ADD COLUMN "is_pinned" BOOLEAN NOT NULL DEFAULT false;
