import { IAnnouncementRepository } from "@src/domain/interfaces/IAnnouncementRepository";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

class SoftDeleteAnnouncementUseCase {
  constructor(private readonly announcementRepository: IAnnouncementRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.announcementRepository.findById(id);
    if (!existing || existing.isSoftDeleted() || !existing.id) {
      throw new NotFoundError(
        ERROR_CODES.ANNOUNCEMENT_NOT_FOUND,
        "Announcement not found"
      );
    }

    const deleted = existing.softDelete();
    await this.announcementRepository.update(existing.id, {
      slug: deleted.slug,
      status: deleted.status,
      priority: deleted.priority,
      startsAt: deleted.startsAt,
      endsAt: deleted.endsAt,
      deletedAt: deleted.deletedAt,
      translations: deleted.translations,
    });
  }
}

export default SoftDeleteAnnouncementUseCase;
