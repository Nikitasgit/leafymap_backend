-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "announcement_status" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "announcement_locale" AS ENUM ('fr', 'en');

-- CreateTable
CREATE TABLE "announcement" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "announcement_status" NOT NULL DEFAULT 'draft',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_translation" (
    "id" TEXT NOT NULL,
    "announcement_id" TEXT NOT NULL,
    "locale" "announcement_locale" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "cta_label" TEXT,
    "cta_href" TEXT,

    CONSTRAINT "announcement_translation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "announcement_slug_key" ON "announcement"("slug");

-- CreateIndex
CREATE INDEX "announcement_status_starts_at_ends_at_idx" ON "announcement"("status", "starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "announcement_deleted_at_idx" ON "announcement"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "announcement_translation_announcement_id_locale_key" ON "announcement_translation"("announcement_id", "locale");

-- AddForeignKey
ALTER TABLE "announcement_translation" ADD CONSTRAINT "announcement_translation_announcement_id_fkey" FOREIGN KEY ("announcement_id") REFERENCES "announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
