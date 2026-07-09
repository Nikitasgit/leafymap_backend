import { getPartnershipsByUserIdQuerySchema } from "../../validations/partnership.validations";
import { IGetPartnershipsByUserIdAction } from "@/actions/partnerships";
import {
  Controller,
  createController,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const GetPartnershipsByUserIdController = (
  getPartnershipsByUserIdAction: IGetPartnershipsByUserIdAction
): Controller =>
  createController({
    execute: (req) => {
      const query = validateOrThrow(
        getPartnershipsByUserIdQuerySchema,
        req.query
      );
      return getPartnershipsByUserIdAction.execute({
        filters: {
          userId: requireObjectIdParam(req, "userId"),
          asCollaborator: query.asCollaborator,
          asInitiator: query.asInitiator,
          status: query.status,
          currentUserId: req.decoded?.id,
        },
      });
    },
    successMessage: "Partnerships retrieved successfully",
  });

export default GetPartnershipsByUserIdController;
