import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { verifyEmailSchema } from "../../validations/auth.validations";
import { IVerifyEmailAction } from "@/actions/auth";
import { validateData } from "@/utils/validation";

class VerifyEmailController {
  constructor(private verifyEmailAction: IVerifyEmailAction) {}

  handle(): RequestHandler {
    return async (
      req: any,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const errors = validateData(verifyEmailSchema, req.query);
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        await this.verifyEmailAction.execute({
          verifyData: verifyEmailSchema.parse(req.query),
        });

        APIResponse(res, null, "Email vérifié avec succès.", 200);
      } catch (error) {
        logger.error("Error in verifyEmail:", error);
        const message =
          error instanceof Error ? error.message : "Lien invalide ou expiré.";
        APIResponse(res, null, message, 400);
      }
    };
  }
}

export default VerifyEmailController;
