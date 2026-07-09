import { requestPasswordResetSchema } from "../../validations/auth.validations";
import { IRequestPasswordResetAction } from "@/actions/auth";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const RequestPasswordResetController = (
  requestPasswordResetAction: IRequestPasswordResetAction
): Controller =>
  createController({
    execute: async (req) => {
      await requestPasswordResetAction.execute({
        requestData: validateOrThrow(requestPasswordResetSchema, req.body),
      });
    },
    successMessage:
      "Si cet email existe dans notre système, un lien de réinitialisation vous a été envoyé.",
  });

export default RequestPasswordResetController;
