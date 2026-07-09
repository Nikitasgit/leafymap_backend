import { resendVerificationEmailSchema } from "../../validations/auth.validations";
import { IResendVerificationEmailAction } from "@/actions/auth";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const ResendVerificationEmailController = (
  resendVerificationEmailAction: IResendVerificationEmailAction
): Controller =>
  createController({
    execute: async (req) => {
      await resendVerificationEmailAction.execute({
        requestData: validateOrThrow(
          resendVerificationEmailSchema,
          req.body
        ),
      });
    },
    successMessage:
      "Si ce compte existe, un nouveau lien de vérification a été envoyé.",
  });

export default ResendVerificationEmailController;
