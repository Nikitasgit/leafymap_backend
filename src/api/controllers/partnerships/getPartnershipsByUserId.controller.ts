import { getPartnershipsByUserIdQuerySchema } from "@src/api/dto/partnerships/partnership.dto";
import type GetPartnershipsByUserIdUseCase from "@src/application/usecases/partnerships/GetPartnershipsByUserId.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetPartnershipsByUserIdController = (
  getPartnershipsByUserIdUseCase: GetPartnershipsByUserIdUseCase
): Controller =>
  createController({
    execute: (req) => {
      const query = validateOrThrow(
        getPartnershipsByUserIdQuerySchema,
        req.query
      );
      return getPartnershipsByUserIdUseCase.execute({
        userId: requireObjectIdParam(req, "userId"),
        asCollaborator: query.asCollaborator,
        asInitiator: query.asInitiator,
        status: query.status,
        currentUserId: req.decoded?.id,
      });
    },
    successMessage: "Partnerships retrieved successfully",
  });

export default GetPartnershipsByUserIdController;
