import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { resetPasswordSchema } from "../../validations/auth.validations";
import { IResetPasswordAction } from "@/actions/auth";
import { validateData } from "@/utils/validation";

class ResetPasswordController {
  constructor(private resetPasswordAction: IResetPasswordAction) {}

  handle(): RequestHandler {
    return async (
      req: any,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const errors = validateData(resetPasswordSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        await this.resetPasswordAction.execute({
          resetData: resetPasswordSchema.parse(req.body),
        });

        APIResponse(
          res,
          null,
          "Votre mot de passe a été réinitialisé avec succès.",
          200
        );
      } catch (error) {
        logger.error("Error in resetPassword:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Failed to reset password";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default ResetPasswordController;
