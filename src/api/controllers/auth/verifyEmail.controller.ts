import { verifyEmailSchema } from "@src/api/dto/auth/auth.dto";
import type VerifyEmailUseCase from "@src/application/usecases/auth/VerifyEmail.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const VerifyEmailController = (
  verifyEmailUseCase: VerifyEmailUseCase
): Controller =>
  createController({
    execute: async (req) => {
      await verifyEmailUseCase.execute(
        validateOrThrow(verifyEmailSchema, req.query)
      );
    },
    successMessage: "Email vérifié avec succès.",
  });

export default VerifyEmailController;
