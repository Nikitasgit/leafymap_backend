import { resendVerificationEmailSchema } from "@src/api/dto/auth/auth.dto";
import type ResendVerificationEmailUseCase from "@src/application/usecases/auth/ResendVerificationEmail.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const ResendVerificationEmailController = (
  resendVerificationEmailUseCase: ResendVerificationEmailUseCase
): Controller =>
  createController({
    execute: async (req) => {
      await resendVerificationEmailUseCase.execute(
        validateOrThrow(resendVerificationEmailSchema, req.body)
      );
    },
    successMessage:
      "Si ce compte existe, un nouveau lien de vérification a été envoyé.",
  });

export default ResendVerificationEmailController;
