import type DeletePartnershipUseCase from "@src/application/usecases/partnerships/DeletePartnership.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const DeletePartnershipController = (
  deletePartnershipUseCase: DeletePartnershipUseCase
): Controller =>
  createController({
    execute: async (req) => {
      await deletePartnershipUseCase.execute({
        partnershipId: requireObjectIdParam(req, "partnershipId"),
        userId: requireAuth(req).id,
      });
    },
    successMessage: "Partnership supprimée avec succès",
  });

export default DeletePartnershipController;
