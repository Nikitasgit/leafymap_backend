import { requestPasswordResetSchema } from "@src/api/dto/auth/auth.dto";
import type RequestPasswordResetUseCase from "@src/application/usecases/auth/RequestPasswordReset.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const RequestPasswordResetController = (
  requestPasswordResetUseCase: RequestPasswordResetUseCase
): Controller =>
  createController({
    execute: async (req) => {
      await requestPasswordResetUseCase.execute(
        validateOrThrow(requestPasswordResetSchema, req.body)
      );
    },
    successMessage:
      "Si cet email existe dans notre système, un lien de réinitialisation vous a été envoyé.",
  });

export default RequestPasswordResetController;
