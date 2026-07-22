import { AnnouncementLocale } from "@src/domain/entities/Announcement.entity";
import { IAnnouncementRepository } from "@src/domain/interfaces/IAnnouncementRepository";
import { ActiveAnnouncementDto } from "@src/application/dtos/announcements/announcement.dto";

export type GetActiveAnnouncementsInput = {
  locale: AnnouncementLocale;
};

class GetActiveAnnouncementsUseCase {
  constructor(private readonly announcementRepository: IAnnouncementRepository) {}

  async execute(
    input: GetActiveAnnouncementsInput
  ): Promise<{ announcements: ActiveAnnouncementDto[] }> {
    const active = await this.announcementRepository.listActive(new Date());

    const announcements: ActiveAnnouncementDto[] = [];
    for (const announcement of active) {
      if (!announcement.id) continue;
      const translation = announcement.translationFor(input.locale);
      if (!translation) continue;

      announcements.push({
        id: announcement.id,
        slug: announcement.slug,
        priority: announcement.priority,
        locale: translation.locale,
        title: translation.title,
        body: translation.body,
        ctaLabel: translation.ctaLabel,
        ctaHref: translation.ctaHref,
      });
    }

    return { announcements };
  }
}

export default GetActiveAnnouncementsUseCase;
