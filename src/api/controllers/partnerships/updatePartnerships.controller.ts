import { updatePartnershipsSchema } from "@src/api/dto/partnerships/partnership.dto";
import type UpdatePartnershipsUseCase from "@src/application/usecases/partnerships/UpdatePartnerships.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const UpdatePartnershipsController = (
  updatePartnershipsUseCase: UpdatePartnershipsUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const body = validateOrThrow(updatePartnershipsSchema, req.body);
      await updatePartnershipsUseCase.execute({
        userId: requireAuth(req).id,
        partnerships: body.partnerships.map((partnership) => ({
          id: partnership._id,
          status: partnership.status,
        })),
      });
    },
    successMessage: "Partnerships updated successfully",
  });

export default UpdatePartnershipsController;
