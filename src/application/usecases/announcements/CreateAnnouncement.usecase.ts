import { Announcement } from "@src/domain/entities/Announcement.entity";
import { IAnnouncementRepository } from "@src/domain/interfaces/IAnnouncementRepository";
import {
  AnnouncementDto,
  toAnnouncementDto,
} from "@src/application/dtos/announcements/announcement.dto";
import { ConflictError, ERROR_CODES, ValidationError } from "@src/shared/errors";

export type CreateAnnouncementInput = {
  slug: string;
  priority?: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
  translations: {
    locale: "fr" | "en";
    title: string;
    body: string;
    ctaLabel?: string | null;
    ctaHref?: string | null;
  }[];
};

class CreateAnnouncementUseCase {
  constructor(private readonly announcementRepository: IAnnouncementRepository) {}

  async execute(input: CreateAnnouncementInput): Promise<AnnouncementDto> {
    const existing = await this.announcementRepository.findBySlug(input.slug);
    if (existing && !existing.isSoftDeleted()) {
      throw new ConflictError(
        ERROR_CODES.ANNOUNCEMENT_SLUG_EXISTS,
        "An announcement with this slug already exists"
      );
    }

    if (
      input.startsAt instanceof Date &&
      input.endsAt instanceof Date &&
      input.endsAt <= input.startsAt
    ) {
      throw new ValidationError({ endsAt: "endsAt must be after startsAt" });
    }

    const announcement = Announcement.create({
      slug: input.slug,
      priority: input.priority,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      translations: input.translations.map((t) => ({
        locale: t.locale,
        title: t.title,
        body: t.body,
        ctaLabel: t.ctaLabel ?? null,
        ctaHref: t.ctaHref ?? null,
      })),
    });

    const created = await this.announcementRepository.create({
      slug: announcement.slug,
      status: announcement.status,
      priority: announcement.priority,
      startsAt: announcement.startsAt,
      endsAt: announcement.endsAt,
      translations: announcement.translations,
    });

    return toAnnouncementDto(created);
  }
}

export default CreateAnnouncementUseCase;
