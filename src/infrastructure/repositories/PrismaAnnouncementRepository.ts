import {
  Announcement,
  AnnouncementLocale,
  AnnouncementTranslationData,
} from "@src/domain/entities/Announcement.entity";
import {
  AnnouncementCreateData,
  AnnouncementUpdateData,
  IAnnouncementRepository,
} from "@src/domain/interfaces/IAnnouncementRepository";
import { prisma } from "@src/infrastructure/persistence/prisma";
import type {
  Announcement as PrismaAnnouncement,
  AnnouncementTranslation as PrismaTranslation,
} from "@prisma/client";

type AnnouncementWithTranslations = PrismaAnnouncement & {
  translations: PrismaTranslation[];
};

class PrismaAnnouncementRepository implements IAnnouncementRepository {
  async create(data: AnnouncementCreateData): Promise<Announcement> {
    const created = await prisma.announcement.create({
      data: {
        slug: data.slug,
        status: data.status,
        priority: data.priority,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        translations: {
          create: data.translations.map((t) => ({
            locale: t.locale,
            title: t.title,
            body: t.body,
            ctaLabel: t.ctaLabel,
            ctaHref: t.ctaHref,
          })),
        },
      },
      include: { translations: true },
    });

    return this.toDomain(created);
  }

  async update(id: string, data: AnnouncementUpdateData): Promise<Announcement> {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.announcementTranslation.deleteMany({
        where: { announcementId: id },
      });

      return tx.announcement.update({
        where: { id },
        data: {
          slug: data.slug,
          status: data.status,
          priority: data.priority,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          deletedAt: data.deletedAt,
          translations: {
            create: data.translations.map((t) => ({
              locale: t.locale,
              title: t.title,
              body: t.body,
              ctaLabel: t.ctaLabel,
              ctaHref: t.ctaHref,
            })),
          },
        },
        include: { translations: true },
      });
    });

    return this.toDomain(updated);
  }

  async findById(id: string): Promise<Announcement | null> {
    const row = await prisma.announcement.findUnique({
      where: { id },
      include: { translations: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Announcement | null> {
    const row = await prisma.announcement.findUnique({
      where: { slug },
      include: { translations: true },
    });
    return row ? this.toDomain(row) : null;
  }

  async listAdmin(): Promise<Announcement[]> {
    const rows = await prisma.announcement.findMany({
      where: { deletedAt: null },
      include: { translations: true },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    });
    return rows.map((row) => this.toDomain(row));
  }

  async listActive(now: Date): Promise<Announcement[]> {
    const rows = await prisma.announcement.findMany({
      where: {
        deletedAt: null,
        status: "published",
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gt: now } }] },
        ],
      },
      include: { translations: true },
      orderBy: [{ priority: "desc" }, { startsAt: "desc" }],
    });
    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: AnnouncementWithTranslations): Announcement {
    const translations: AnnouncementTranslationData[] = row.translations.map(
      (t) => ({
        locale: t.locale as AnnouncementLocale,
        title: t.title,
        body: t.body,
        ctaLabel: t.ctaLabel,
        ctaHref: t.ctaHref,
      })
    );

    return Announcement.reconstitute({
      id: row.id,
      slug: row.slug,
      status: row.status,
      priority: row.priority,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      deletedAt: row.deletedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      translations,
    });
  }
}

export default PrismaAnnouncementRepository;
