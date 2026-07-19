import { resetPasswordSchema } from "@src/api/dto/auth/auth.dto";
import type ResetPasswordUseCase from "@src/application/usecases/auth/ResetPassword.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const ResetPasswordController = (
  resetPasswordUseCase: ResetPasswordUseCase
): Controller =>
  createController({
    execute: async (req) => {
      await resetPasswordUseCase.execute(
        validateOrThrow(resetPasswordSchema, req.body)
      );
    },
    successMessage: "Votre mot de passe a été réinitialisé avec succès.",
  });

export default ResetPasswordController;
