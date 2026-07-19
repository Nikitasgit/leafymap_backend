import { acceptCguSchema } from "@src/api/dto/auth/auth.dto";
import type AcceptCguUseCase from "@src/application/usecases/auth/AcceptCgu.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const AcceptCguController = (acceptCguUseCase: AcceptCguUseCase): Controller =>
  createController({
    execute: async (req) => {
      const { emailNotifications } = validateOrThrow(
        acceptCguSchema,
        req.body ?? {}
      );
      await acceptCguUseCase.execute({
        userId: requireAuth(req).id,
        emailNotifications,
      });
    },
    successMessage: "CGU accepted",
  });

export default AcceptCguController;
