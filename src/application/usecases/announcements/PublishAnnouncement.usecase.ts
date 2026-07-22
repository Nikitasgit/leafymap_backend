import { IAnnouncementRepository } from "@src/domain/interfaces/IAnnouncementRepository";
import {
  AnnouncementDto,
  toAnnouncementDto,
} from "@src/application/dtos/announcements/announcement.dto";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

class PublishAnnouncementUseCase {
  constructor(private readonly announcementRepository: IAnnouncementRepository) {}

  async execute(id: string): Promise<AnnouncementDto> {
    const existing = await this.announcementRepository.findById(id);
    if (!existing || existing.isSoftDeleted() || !existing.id) {
      throw new NotFoundError(
        ERROR_CODES.ANNOUNCEMENT_NOT_FOUND,
        "Announcement not found"
      );
    }

    const published = existing.publish();
    const saved = await this.announcementRepository.update(existing.id, {
      slug: published.slug,
      status: published.status,
      priority: published.priority,
      startsAt: published.startsAt,
      endsAt: published.endsAt,
      deletedAt: published.deletedAt,
      translations: published.translations,
    });

    return toAnnouncementDto(saved);
  }
}

export default PublishAnnouncementUseCase;
