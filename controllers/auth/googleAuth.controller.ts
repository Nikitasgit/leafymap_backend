import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { googleAuthSchema } from "../../validations/auth.validations";
import { IGoogleAuthAction } from "@/actions/auth";
import { setTokenCookie } from "@/utils/jwt";
import { validateData } from "@/utils/validation";

class GoogleAuthController {
  constructor(private googleAuthAction: IGoogleAuthAction) {}

  handle(): RequestHandler {
    return async (
      req: any,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const errors = validateData(googleAuthSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        const { id_token } = googleAuthSchema.parse(req.body);
        const { user, token, mergedUnverifiedAccount } =
          await this.googleAuthAction.execute({
            googleAuthData: { idToken: id_token },
          });

        setTokenCookie(res, token);
        APIResponse(
          res,
          { user, mergedUnverifiedAccount: !!mergedUnverifiedAccount },
          "Logged in",
          200
        );
      } catch (error) {
        logger.error("Error in googleAuth:", error);
        const message =
          error instanceof Error ? error.message : "Failed to sign in with Google";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GoogleAuthController;
