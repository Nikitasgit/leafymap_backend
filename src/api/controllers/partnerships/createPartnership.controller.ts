import { createPartnershipSchema } from "@src/api/dto/partnerships/partnership.dto";
import { ICreatePartnershipUseCase } from "@src/application/usecases/partnerships/CreatePartnership.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const CreatePartnershipController = (
  createPartnershipUseCase: ICreatePartnershipUseCase
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
