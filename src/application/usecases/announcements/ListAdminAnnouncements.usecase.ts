import { IAnnouncementRepository } from "@src/domain/interfaces/IAnnouncementRepository";
import {
  AnnouncementDto,
  toAnnouncementDto,
} from "@src/application/dtos/announcements/announcement.dto";

class ListAdminAnnouncementsUseCase {
  constructor(private readonly announcementRepository: IAnnouncementRepository) {}

  async execute(): Promise<{ announcements: AnnouncementDto[] }> {
    const announcements = await this.announcementRepository.listAdmin();
    return {
      announcements: announcements.map(toAnnouncementDto),
    };
  }
}

export default ListAdminAnnouncementsUseCase;
