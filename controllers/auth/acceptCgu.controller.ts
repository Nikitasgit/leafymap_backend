import { acceptCguSchema } from "../../validations/auth.validations";
import { IAcceptCguAction } from "@/actions/auth";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const AcceptCguController = (acceptCguAction: IAcceptCguAction): Controller =>
  createController({
    execute: async (req) => {
      const { emailNotifications } = validateOrThrow(
        acceptCguSchema,
        req.body ?? {}
      );
      await acceptCguAction.execute({
        userId: requireAuth(req).id,
        emailNotifications,
      });
    },
    successMessage: "CGU accepted",
  });

export default AcceptCguController;
