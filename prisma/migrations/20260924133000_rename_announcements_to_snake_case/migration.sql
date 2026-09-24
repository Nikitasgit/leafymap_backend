-- The init migration already applied in production created PascalCase
-- tables and columns. This migration renames them in place so the live
-- rows match schema.prisma (@@map / @map) without dropping data.

ALTER TYPE "AnnouncementStatus" RENAME TO "announcement_status";
ALTER TYPE "AnnouncementLocale" RENAME TO "announcement_locale";

ALTER TABLE "Announcement" RENAME COLUMN "startsAt" TO "starts_at";
ALTER TABLE "Announcement" RENAME COLUMN "endsAt" TO "ends_at";
ALTER TABLE "Announcement" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "Announcement" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Announcement" RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "AnnouncementTranslation" RENAME COLUMN "announcementId" TO "announcement_id";
ALTER TABLE "AnnouncementTranslation" RENAME COLUMN "ctaLabel" TO "cta_label";
ALTER TABLE "AnnouncementTranslation" RENAME COLUMN "ctaHref" TO "cta_href";

ALTER INDEX "Announcement_pkey" RENAME TO "announcement_pkey";
ALTER INDEX "Announcement_slug_key" RENAME TO "announcement_slug_key";
ALTER INDEX "Announcement_status_startsAt_endsAt_idx" RENAME TO "announcement_status_starts_at_ends_at_idx";
ALTER INDEX "Announcement_deletedAt_idx" RENAME TO "announcement_deleted_at_idx";

ALTER INDEX "AnnouncementTranslation_pkey" RENAME TO "announcement_translation_pkey";
ALTER INDEX "AnnouncementTranslation_announcementId_locale_key" RENAME TO "announcement_translation_announcement_id_locale_key";

ALTER TABLE "AnnouncementTranslation"
  RENAME CONSTRAINT "AnnouncementTranslation_announcementId_fkey"
  TO "announcement_translation_announcement_id_fkey";

ALTER TABLE "Announcement" RENAME TO "announcement";
ALTER TABLE "AnnouncementTranslation" RENAME TO "announcement_translation";
