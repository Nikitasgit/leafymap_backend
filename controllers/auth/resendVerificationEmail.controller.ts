import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { resendVerificationEmailSchema } from "../../validations/auth.validations";
import { IResendVerificationEmailAction } from "@/actions/auth";
import { validateData } from "@/utils/validation";

class ResendVerificationEmailController {
  constructor(
    private resendVerificationEmailAction: IResendVerificationEmailAction
  ) {}

  handle(): RequestHandler {
    return async (
      req: any,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const errors = validateData(
          resendVerificationEmailSchema,
          req.body
        );
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        await this.resendVerificationEmailAction.execute({
          requestData: resendVerificationEmailSchema.parse(req.body),
        });

        APIResponse(
          res,
          null,
          "Si ce compte existe, un nouveau lien de vérification a été envoyé.",
          200
        );
      } catch (error) {
        logger.error("Error in resendVerificationEmail:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Erreur lors de l'envoi du lien de vérification.";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default ResendVerificationEmailController;
