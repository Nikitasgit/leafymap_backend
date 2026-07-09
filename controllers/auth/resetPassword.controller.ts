import { resetPasswordSchema } from "../../validations/auth.validations";
import { IResetPasswordAction } from "@/actions/auth";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const ResetPasswordController = (
  resetPasswordAction: IResetPasswordAction
): Controller =>
  createController({
    execute: async (req) => {
      await resetPasswordAction.execute({
        resetData: validateOrThrow(resetPasswordSchema, req.body),
      });
    },
    successMessage: "Votre mot de passe a été réinitialisé avec succès.",
  });

export default ResetPasswordController;
