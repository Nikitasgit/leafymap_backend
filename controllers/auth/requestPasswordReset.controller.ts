import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { requestPasswordResetSchema } from "../../validations/auth.validations";
import { IRequestPasswordResetAction } from "@/actions/auth";
import { validateData } from "@/utils/validation";

class RequestPasswordResetController {
  constructor(private requestPasswordResetAction: IRequestPasswordResetAction) {}

  handle(): RequestHandler {
    return async (
      req: any,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const errors = validateData(requestPasswordResetSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        await this.requestPasswordResetAction.execute({
          requestData: requestPasswordResetSchema.parse(req.body),
        });

        APIResponse(
          res,
          null,
          "Si cet email existe dans notre système, un lien de réinitialisation vous a été envoyé.",
          200
        );
      } catch (error) {
        logger.error("Error in requestPasswordReset:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to request password reset";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default RequestPasswordResetController;
