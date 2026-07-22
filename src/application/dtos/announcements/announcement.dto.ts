import {
  AnnouncementLocale,
  AnnouncementStatus,
  AnnouncementTranslationData,
} from "@src/domain/entities/Announcement.entity";

export type AnnouncementTranslationDto = AnnouncementTranslationData;

export type AnnouncementDto = {
  id: string;
  slug: string;
  status: AnnouncementStatus;
  priority: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  translations: AnnouncementTranslationDto[];
};

export type ActiveAnnouncementDto = {
  id: string;
  slug: string;
  priority: number;
  locale: AnnouncementLocale;
  title: string;
  body: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export function toAnnouncementDto(announcement: {
  id: string | null;
  slug: string;
  status: AnnouncementStatus;
  priority: number;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  translations: AnnouncementTranslationData[];
}): AnnouncementDto {
  if (!announcement.id) {
    throw new Error("Announcement id is required for DTO mapping");
  }

  return {
    id: announcement.id,
    slug: announcement.slug,
    status: announcement.status,
    priority: announcement.priority,
    startsAt: announcement.startsAt?.toISOString() ?? null,
    endsAt: announcement.endsAt?.toISOString() ?? null,
    createdAt: announcement.createdAt.toISOString(),
    updatedAt: announcement.updatedAt.toISOString(),
    translations: announcement.translations,
  };
}
