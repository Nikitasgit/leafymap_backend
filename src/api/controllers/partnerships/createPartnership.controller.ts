import { createPartnershipSchema } from "@src/api/dto/partnerships/partnership.dto";
import type CreatePartnershipUseCase from "@src/application/usecases/partnerships/CreatePartnership.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const CreatePartnershipController = (
  createPartnershipUseCase: CreatePartnershipUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const body = validateOrThrow(createPartnershipSchema, req.body);
      return createPartnershipUseCase.execute({
        collaboratorId: body.partnership.collaborator._id,
        initiatorId: requireAuth(req).id,
      });
    },
    successMessage: "Partnership created successfully",
    successStatus: 201,
  });

export default CreatePartnershipController;
