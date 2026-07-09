import { verifyEmailSchema } from "../../validations/auth.validations";
import { IVerifyEmailAction } from "@/actions/auth";
import { Controller, createController, validateOrThrow } from "@/utils/controllerFactory";

const VerifyEmailController = (verifyEmailAction: IVerifyEmailAction): Controller =>
  createController({
    execute: async (req) => {
      await verifyEmailAction.execute({
        verifyData: validateOrThrow(verifyEmailSchema, req.query),
      });
    },
    successMessage: "Email vérifié avec succès.",
  });

export default VerifyEmailController;
