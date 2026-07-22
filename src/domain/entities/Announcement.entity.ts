export const ANNOUNCEMENT_STATUSES = ["draft", "published", "archived"] as const;
export type AnnouncementStatus = (typeof ANNOUNCEMENT_STATUSES)[number];

export const ANNOUNCEMENT_LOCALES = ["fr", "en"] as const;
export type AnnouncementLocale = (typeof ANNOUNCEMENT_LOCALES)[number];

export type AnnouncementTranslationData = {
  locale: AnnouncementLocale;
  title: string;
  body: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export type CreateAnnouncementParams = {
  slug: string;
  priority?: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
  translations: AnnouncementTranslationData[];
};

export type ReconstituteAnnouncementParams = {
  id: string;
  slug: string;
  status: AnnouncementStatus;
  priority: number;
  startsAt: Date | null;
  endsAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  translations: AnnouncementTranslationData[];
};

export class Announcement {
  private constructor(
    public readonly id: string | null,
    public readonly slug: string,
    public readonly status: AnnouncementStatus,
    public readonly priority: number,
    public readonly startsAt: Date | null,
    public readonly endsAt: Date | null,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly translations: AnnouncementTranslationData[]
  ) {}

  static create(params: CreateAnnouncementParams): Announcement {
    const now = new Date();
    return new Announcement(
      null,
      params.slug,
      "draft",
      params.priority ?? 0,
      params.startsAt ?? null,
      params.endsAt ?? null,
      null,
      now,
      now,
      params.translations
    );
  }

  static reconstitute(params: ReconstituteAnnouncementParams): Announcement {
    return new Announcement(
      params.id,
      params.slug,
      params.status,
      params.priority,
      params.startsAt,
      params.endsAt,
      params.deletedAt,
      params.createdAt,
      params.updatedAt,
      params.translations
    );
  }

  withUpdates(params: {
    slug?: string;
    priority?: number;
    startsAt?: Date | null;
    endsAt?: Date | null;
    translations?: AnnouncementTranslationData[];
  }): Announcement {
    return new Announcement(
      this.id,
      params.slug ?? this.slug,
      this.status,
      params.priority ?? this.priority,
      params.startsAt !== undefined ? params.startsAt : this.startsAt,
      params.endsAt !== undefined ? params.endsAt : this.endsAt,
      this.deletedAt,
      this.createdAt,
      new Date(),
      params.translations ?? this.translations
    );
  }

  publish(): Announcement {
    return new Announcement(
      this.id,
      this.slug,
      "published",
      this.priority,
      this.startsAt,
      this.endsAt,
      this.deletedAt,
      this.createdAt,
      new Date(),
      this.translations
    );
  }

  archive(): Announcement {
    return new Announcement(
      this.id,
      this.slug,
      "archived",
      this.priority,
      this.startsAt,
      this.endsAt,
      this.deletedAt,
      this.createdAt,
      new Date(),
      this.translations
    );
  }

  softDelete(): Announcement {
    return new Announcement(
      this.id,
      this.slug,
      this.status,
      this.priority,
      this.startsAt,
      this.endsAt,
      new Date(),
      this.createdAt,
      new Date(),
      this.translations
    );
  }

  isSoftDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isActiveAt(now: Date = new Date()): boolean {
    if (this.deletedAt !== null) return false;
    if (this.status !== "published") return false;
    if (this.startsAt !== null && this.startsAt > now) return false;
    if (this.endsAt !== null && this.endsAt <= now) return false;
    return true;
  }

  translationFor(
    locale: AnnouncementLocale,
    fallback: AnnouncementLocale = "fr"
  ): AnnouncementTranslationData | null {
    return (
      this.translations.find((t) => t.locale === locale) ??
      this.translations.find((t) => t.locale === fallback) ??
      this.translations[0] ??
      null
    );
  }
}
