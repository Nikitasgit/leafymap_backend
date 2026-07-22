import { IAnnouncementRepository } from "@src/domain/interfaces/IAnnouncementRepository";
import {
  AnnouncementDto,
  toAnnouncementDto,
} from "@src/application/dtos/announcements/announcement.dto";
import {
  ConflictError,
  ERROR_CODES,
  NotFoundError,
  ValidationError,
} from "@src/shared/errors";

export type UpdateAnnouncementInput = {
  id: string;
  slug?: string;
  priority?: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
  translations?: {
    locale: "fr" | "en";
    title: string;
    body: string;
    ctaLabel?: string | null;
    ctaHref?: string | null;
  }[];
};

class UpdateAnnouncementUseCase {
  constructor(private readonly announcementRepository: IAnnouncementRepository) {}

  async execute(input: UpdateAnnouncementInput): Promise<AnnouncementDto> {
    const existing = await this.announcementRepository.findById(input.id);
    if (!existing || existing.isSoftDeleted() || !existing.id) {
      throw new NotFoundError(
        ERROR_CODES.ANNOUNCEMENT_NOT_FOUND,
        "Announcement not found"
      );
    }

    if (input.slug && input.slug !== existing.slug) {
      const slugOwner = await this.announcementRepository.findBySlug(input.slug);
      if (slugOwner && slugOwner.id !== existing.id && !slugOwner.isSoftDeleted()) {
        throw new ConflictError(
          ERROR_CODES.ANNOUNCEMENT_SLUG_EXISTS,
          "An announcement with this slug already exists"
        );
      }
    }

    const startsAt =
      input.startsAt !== undefined ? input.startsAt : existing.startsAt;
    const endsAt = input.endsAt !== undefined ? input.endsAt : existing.endsAt;

    if (
      startsAt instanceof Date &&
      endsAt instanceof Date &&
      endsAt <= startsAt
    ) {
      throw new ValidationError({ endsAt: "endsAt must be after startsAt" });
    }

    const updatedEntity = existing.withUpdates({
      slug: input.slug,
      priority: input.priority,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      translations: input.translations?.map((t) => ({
        locale: t.locale,
        title: t.title,
        body: t.body,
        ctaLabel: t.ctaLabel ?? null,
        ctaHref: t.ctaHref ?? null,
      })),
    });

    const saved = await this.announcementRepository.update(existing.id, {
      slug: updatedEntity.slug,
      status: updatedEntity.status,
      priority: updatedEntity.priority,
      startsAt: updatedEntity.startsAt,
      endsAt: updatedEntity.endsAt,
      deletedAt: updatedEntity.deletedAt,
      translations: updatedEntity.translations,
    });

    return toAnnouncementDto(saved);
  }
}

export default UpdateAnnouncementUseCase;
