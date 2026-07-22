import { RequestHandler } from "express";
import {
  announcementIdParamSchema,
  createAnnouncementSchema,
  getActiveAnnouncementsQuerySchema,
  updateAnnouncementSchema,
} from "@src/api/dto/announcements/announcement.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import { validateOrThrow } from "@src/api/http/controllerFactory";
import type CreateAnnouncementUseCase from "@src/application/usecases/announcements/CreateAnnouncement.usecase";
import type UpdateAnnouncementUseCase from "@src/application/usecases/announcements/UpdateAnnouncement.usecase";
import type PublishAnnouncementUseCase from "@src/application/usecases/announcements/PublishAnnouncement.usecase";
import type ArchiveAnnouncementUseCase from "@src/application/usecases/announcements/ArchiveAnnouncement.usecase";
import type SoftDeleteAnnouncementUseCase from "@src/application/usecases/announcements/SoftDeleteAnnouncement.usecase";
import type GetAnnouncementByIdUseCase from "@src/application/usecases/announcements/GetAnnouncementById.usecase";
import type ListAdminAnnouncementsUseCase from "@src/application/usecases/announcements/ListAdminAnnouncements.usecase";
import type GetActiveAnnouncementsUseCase from "@src/application/usecases/announcements/GetActiveAnnouncements.usecase";

class AnnouncementsController extends BaseHttpController {
  constructor(
    private readonly createAnnouncementUseCase: CreateAnnouncementUseCase,
    private readonly updateAnnouncementUseCase: UpdateAnnouncementUseCase,
    private readonly publishAnnouncementUseCase: PublishAnnouncementUseCase,
    private readonly archiveAnnouncementUseCase: ArchiveAnnouncementUseCase,
    private readonly softDeleteAnnouncementUseCase: SoftDeleteAnnouncementUseCase,
    private readonly getAnnouncementByIdUseCase: GetAnnouncementByIdUseCase,
    private readonly listAdminAnnouncementsUseCase: ListAdminAnnouncementsUseCase,
    private readonly getActiveAnnouncementsUseCase: GetActiveAnnouncementsUseCase
  ) {
    super();
  }

  listActive(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const { locale } = validateOrThrow(
          getActiveAnnouncementsQuerySchema,
          req.query
        );
        return this.getActiveAnnouncementsUseCase.execute({ locale });
      },
      successMessage: "Annonces récupérées avec succès",
    });
  }

  listAdmin(): RequestHandler {
    return this.handler({
      execute: () => this.listAdminAnnouncementsUseCase.execute(),
      successMessage: "Annonces admin récupérées avec succès",
    });
  }

  getById(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const { id } = validateOrThrow(announcementIdParamSchema, req.params);
        return this.getAnnouncementByIdUseCase.execute(id);
      },
      successMessage: "Annonce récupérée avec succès",
      mapResult: (announcement) => ({ announcement }),
    });
  }

  create(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const body = validateOrThrow(createAnnouncementSchema, req.body);
        return this.createAnnouncementUseCase.execute(body);
      },
      successMessage: "Annonce créée avec succès",
      successStatus: 201,
      mapResult: (announcement) => ({ announcement }),
    });
  }

  update(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const { id } = validateOrThrow(announcementIdParamSchema, req.params);
        const body = validateOrThrow(updateAnnouncementSchema, req.body);
        return this.updateAnnouncementUseCase.execute({ id, ...body });
      },
      successMessage: "Annonce mise à jour avec succès",
      mapResult: (announcement) => ({ announcement }),
    });
  }

  publish(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const { id } = validateOrThrow(announcementIdParamSchema, req.params);
        return this.publishAnnouncementUseCase.execute(id);
      },
      successMessage: "Annonce publiée avec succès",
      mapResult: (announcement) => ({ announcement }),
    });
  }

  archive(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const { id } = validateOrThrow(announcementIdParamSchema, req.params);
        return this.archiveAnnouncementUseCase.execute(id);
      },
      successMessage: "Annonce archivée avec succès",
      mapResult: (announcement) => ({ announcement }),
    });
  }

  softDelete(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const { id } = validateOrThrow(announcementIdParamSchema, req.params);
        await this.softDeleteAnnouncementUseCase.execute(id);
      },
      successMessage: "Annonce supprimée avec succès",
    });
  }
}

export default AnnouncementsController;
