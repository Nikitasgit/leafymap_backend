-- AlterTable
ALTER TABLE "announcement_translation" ADD COLUMN "note" TEXT NOT NULL DEFAULT '';

ALTER TABLE "announcement_translation" ALTER COLUMN "note" DROP DEFAULT;
