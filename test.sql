-- 1. Enrichissement du profil utilisateur (coordonnées de contact)
ALTER TABLE "user"
 ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
 ADD COLUMN IF NOT EXISTS website VARCHAR(255);


-- 2. Préférence RGPD : notifications e-mail paramétrables
ALTER TABLE "user"
 ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE;


-- 3. Réservation : capacité et plafond par commande
ALTER TABLE event
 ADD COLUMN IF NOT EXISTS is_bookable BOOLEAN NOT NULL DEFAULT FALSE,
 ADD COLUMN IF NOT EXISTS capacity INT,
 ADD COLUMN IF NOT EXISTS max_seats_per_booking INT;


ALTER TABLE event
 ADD CONSTRAINT chk_event_capacity CHECK (capacity IS NULL OR capacity > 0),
 ADD CONSTRAINT chk_event_max_seats CHECK (
   max_seats_per_booking IS NULL OR max_seats_per_booking > 0
 );


-- 4. Renforcement de l’intégrité des avis
ALTER TABLE review
 ADD CONSTRAINT chk_review_rating CHECK (rating >= 1 AND rating <= 5);


-- 5. Module CMS d’annonces (PostgreSQL réel — Prisma)
CREATE TYPE "AnnouncementStatus" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "AnnouncementLocale" AS ENUM ('fr', 'en');


CREATE TABLE "Announcement" (
 "id"        TEXT NOT NULL,
 "slug"      TEXT NOT NULL,
 "status"    "AnnouncementStatus" NOT NULL DEFAULT 'draft',
 "priority"  INTEGER NOT NULL DEFAULT 0,
 "startsAt"  TIMESTAMP(3),
 "endsAt"    TIMESTAMP(3),
 "deletedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "AnnouncementTranslation" (
 "id"             TEXT NOT NULL,
 "announcementId" TEXT NOT NULL,
 "locale"         "AnnouncementLocale" NOT NULL,
 "title"          TEXT NOT NULL,
 "body"           TEXT NOT NULL,
 "ctaLabel"       TEXT,
 "ctaHref"        TEXT,
 CONSTRAINT "AnnouncementTranslation_pkey" PRIMARY KEY ("id")
);


CREATE UNIQUE INDEX "Announcement_slug_key"
 ON "Announcement"("slug");
CREATE INDEX "Announcement_status_startsAt_endsAt_idx"
 ON "Announcement"("status", "startsAt", "endsAt");
CREATE UNIQUE INDEX "AnnouncementTranslation_announcementId_locale_key"
 ON "AnnouncementTranslation"("announcementId", "locale");


ALTER TABLE "AnnouncementTranslation"
 ADD CONSTRAINT "AnnouncementTranslation_announcementId_fkey"
 FOREIGN KEY ("announcementId") REFERENCES "Announcement"("id")
 ON DELETE CASCADE ON UPDATE CASCADE;

const { rows } = await this.pool.query(
 `
 SELECT
   a.id,
   a.slug,
   a.status,
   a.priority,
   a.starts_at,
   a.ends_at,
   t.locale,
   t.title,
   t.body,
   t.cta_label,
   t.cta_href
 FROM announcement AS a
 LEFT JOIN announcement_translation AS t
   ON t.announcement_id = a.id
 WHERE a.deleted_at IS NULL
   AND a.status = 'published'
   AND (a.starts_at IS NULL OR a.starts_at <= $1)
   AND (a.ends_at IS NULL OR a.ends_at > $1)
 ORDER BY a.priority DESC, a.starts_at DESC
 `,
 [now]
);
return rows.map((row) => this.toDomain(row));
