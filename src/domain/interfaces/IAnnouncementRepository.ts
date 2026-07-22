import {
  Announcement,
  AnnouncementLocale,
  AnnouncementTranslationData,
  AnnouncementStatus,
} from "@src/domain/entities/Announcement.entity";

export type AnnouncementCreateData = {
  slug: string;
  status: AnnouncementStatus;
  priority: number;
  startsAt: Date | null;
  endsAt: Date | null;
  translations: AnnouncementTranslationData[];
};

export type AnnouncementUpdateData = {
  slug: string;
  status: AnnouncementStatus;
  priority: number;
  startsAt: Date | null;
  endsAt: Date | null;
  deletedAt: Date | null;
  translations: AnnouncementTranslationData[];
};

export interface IAnnouncementRepository {
  create(data: AnnouncementCreateData): Promise<Announcement>;
  update(id: string, data: AnnouncementUpdateData): Promise<Announcement>;
  findById(id: string): Promise<Announcement | null>;
  findBySlug(slug: string): Promise<Announcement | null>;
  listAdmin(): Promise<Announcement[]>;
  listActive(now: Date): Promise<Announcement[]>;
}

export type { AnnouncementLocale };
