import { asClass, AwilixContainer } from "awilix";
import AnnouncementsController from "@src/api/controllers/AnnouncementsController";
import CreateAnnouncementUseCase from "@src/application/usecases/announcements/CreateAnnouncement.usecase";
import UpdateAnnouncementUseCase from "@src/application/usecases/announcements/UpdateAnnouncement.usecase";
import PublishAnnouncementUseCase from "@src/application/usecases/announcements/PublishAnnouncement.usecase";
import ArchiveAnnouncementUseCase from "@src/application/usecases/announcements/ArchiveAnnouncement.usecase";
import SoftDeleteAnnouncementUseCase from "@src/application/usecases/announcements/SoftDeleteAnnouncement.usecase";
import GetAnnouncementByIdUseCase from "@src/application/usecases/announcements/GetAnnouncementById.usecase";
import ListAdminAnnouncementsUseCase from "@src/application/usecases/announcements/ListAdminAnnouncements.usecase";
import GetActiveAnnouncementsUseCase from "@src/application/usecases/announcements/GetActiveAnnouncements.usecase";
import type { Cradle } from "@src/di/cradle";

export const registerAnnouncementsModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    createAnnouncementUseCase: asClass(CreateAnnouncementUseCase).singleton(),
    updateAnnouncementUseCase: asClass(UpdateAnnouncementUseCase).singleton(),
    publishAnnouncementUseCase: asClass(PublishAnnouncementUseCase).singleton(),
    archiveAnnouncementUseCase: asClass(ArchiveAnnouncementUseCase).singleton(),
    softDeleteAnnouncementUseCase: asClass(
      SoftDeleteAnnouncementUseCase
    ).singleton(),
    getAnnouncementByIdUseCase: asClass(GetAnnouncementByIdUseCase).singleton(),
    listAdminAnnouncementsUseCase: asClass(
      ListAdminAnnouncementsUseCase
    ).singleton(),
    getActiveAnnouncementsUseCase: asClass(
      GetActiveAnnouncementsUseCase
    ).singleton(),

    announcementsController: asClass(AnnouncementsController).singleton(),
  });
};
