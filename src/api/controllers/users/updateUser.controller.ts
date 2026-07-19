import { newCreatorSchema } from "@src/api/dto/users/user.dto";
import type UpdateUserUseCase from "@src/application/usecases/users/UpdateUser.usecase";
import { setTokenCookie } from "@src/infrastructure/auth/jwt";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const UpdateUserController = (
  updateUserUseCase: UpdateUserUseCase
): Controller =>
  createController({
    execute: async (req, res) => {
      let updateData = req.body as Record<string, unknown>;
      if (req.body.userType === "creator") {
        const parsed = validateOrThrow(newCreatorSchema, req.body);
        updateData = Object.fromEntries(
          Object.entries(parsed).filter(([, v]) => v !== undefined)
        );
      }

      const result = await updateUserUseCase.execute({
        userId: requireAuth(req).id,
        updateData,
      });

      if (result.token) {
        setTokenCookie(res, result.token);
      }
    },
    successMessage: "User updated successfully",
  });

export default UpdateUserController;
