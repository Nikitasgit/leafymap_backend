import { RequestHandler } from "express";
import {
  createPartnershipSchema,
  getPartnershipsByUserIdQuerySchema,
  updatePartnershipsSchema,
} from "@src/api/dto/partnerships/partnership.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type CreatePartnershipUseCase from "@src/application/usecases/partnerships/CreatePartnership.usecase";
import type DeletePartnershipUseCase from "@src/application/usecases/partnerships/DeletePartnership.usecase";
import type GetPartnershipsByUserIdUseCase from "@src/application/usecases/partnerships/GetPartnershipsByUserId.usecase";
import type UpdatePartnershipsUseCase from "@src/application/usecases/partnerships/UpdatePartnerships.usecase";

class PartnershipsController extends BaseHttpController {
  constructor(
    private readonly createPartnershipUseCase: CreatePartnershipUseCase,
    private readonly updatePartnershipsUseCase: UpdatePartnershipsUseCase,
    private readonly deletePartnershipUseCase: DeletePartnershipUseCase,
    private readonly getPartnershipsByUserIdUseCase: GetPartnershipsByUserIdUseCase
  ) {
    super();
  }

  create(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const body = validateOrThrow(createPartnershipSchema, req.body);
        return this.createPartnershipUseCase.execute({
          collaboratorId: body.partnership.collaborator._id,
          initiatorId: requireAuth(req).id,
        });
      },
      successMessage: "Partnership created successfully",
      successStatus: 201,
    });
  }

  update(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const body = validateOrThrow(updatePartnershipsSchema, req.body);
        await this.updatePartnershipsUseCase.execute({
          userId: requireAuth(req).id,
          partnerships: body.partnerships.map((partnership) => ({
            id: partnership._id,
            status: partnership.status,
          })),
        });
      },
      successMessage: "Partnerships updated successfully",
    });
  }

  delete(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.deletePartnershipUseCase.execute({
          partnershipId: requireObjectIdParam(req, "partnershipId"),
          userId: requireAuth(req).id,
        });
      },
      successMessage: "Partnership supprimée avec succès",
    });
  }

  listByUser(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const query = validateOrThrow(
          getPartnershipsByUserIdQuerySchema,
          req.query
        );
        return this.getPartnershipsByUserIdUseCase.execute({
          userId: requireObjectIdParam(req, "userId"),
          asCollaborator: query.asCollaborator,
          asInitiator: query.asInitiator,
          status: query.status,
          currentUserId: req.decoded?.id,
        });
      },
      successMessage: "Partnerships retrieved successfully",
    });
  }
}

export default PartnershipsController;
