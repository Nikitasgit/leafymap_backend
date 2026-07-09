import { IDeletePartnershipAction } from "@/actions/partnerships";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const DeletePartnershipController = (
  deletePartnershipAction: IDeletePartnershipAction
): Controller =>
  createController({
    execute: async (req) => {
      await deletePartnershipAction.execute({
        partnershipId: requireObjectIdParam(req, "partnershipId"),
        userId: requireAuth(req).id,
      });
    },
    successMessage: "Partnership supprimée avec succès",
  });

export default DeletePartnershipController;
