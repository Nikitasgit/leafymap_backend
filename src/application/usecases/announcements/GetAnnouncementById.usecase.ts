import { IAnnouncementRepository } from "@src/domain/interfaces/IAnnouncementRepository";
import {
  AnnouncementDto,
  toAnnouncementDto,
} from "@src/application/dtos/announcements/announcement.dto";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

class GetAnnouncementByIdUseCase {
  constructor(private readonly announcementRepository: IAnnouncementRepository) {}

  async execute(id: string): Promise<AnnouncementDto> {
    const announcement = await this.announcementRepository.findById(id);
    if (!announcement || announcement.isSoftDeleted()) {
      throw new NotFoundError(
        ERROR_CODES.ANNOUNCEMENT_NOT_FOUND,
        "Announcement not found"
      );
    }
    return toAnnouncementDto(announcement);
  }
}

export default GetAnnouncementByIdUseCase;
