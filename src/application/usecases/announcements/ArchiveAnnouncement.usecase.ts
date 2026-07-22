import { IAnnouncementRepository } from "@src/domain/interfaces/IAnnouncementRepository";
import {
  AnnouncementDto,
  toAnnouncementDto,
} from "@src/application/dtos/announcements/announcement.dto";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

class ArchiveAnnouncementUseCase {
  constructor(private readonly announcementRepository: IAnnouncementRepository) {}

  async execute(id: string): Promise<AnnouncementDto> {
    const existing = await this.announcementRepository.findById(id);
    if (!existing || existing.isSoftDeleted() || !existing.id) {
      throw new NotFoundError(
        ERROR_CODES.ANNOUNCEMENT_NOT_FOUND,
        "Announcement not found"
      );
    }

    const archived = existing.archive();
    const saved = await this.announcementRepository.update(existing.id, {
      slug: archived.slug,
      status: archived.status,
      priority: archived.priority,
      startsAt: archived.startsAt,
      endsAt: archived.endsAt,
      deletedAt: archived.deletedAt,
      translations: archived.translations,
    });

    return toAnnouncementDto(saved);
  }
}

export default ArchiveAnnouncementUseCase;
