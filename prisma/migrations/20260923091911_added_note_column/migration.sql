/*
  Warnings:

  - Added the required column `note` to the `announcement_translation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "announcement_translation" ADD COLUMN "note" TEXT NOT NULL DEFAULT '';


