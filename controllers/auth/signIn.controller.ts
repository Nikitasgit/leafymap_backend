import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { loginSchema } from "../../validations/auth.validations";
import { ISignInAction } from "@/actions/auth";
import { setTokenCookie } from "@/utils/jwt";
import { validateData } from "@/utils/validation";

class SignInController {
  constructor(private signInAction: ISignInAction) {}

  handle(): RequestHandler {
    return async (
      req: any,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const errors = validateData(loginSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        const { user, token } = await this.signInAction.execute({
          signInData: loginSchema.parse(req.body),
        });

        setTokenCookie(res, token);
        APIResponse(res, { user }, "Logged in", 200);
      } catch (error) {
        logger.error("Error in signIn:", error);
        const message =
          error instanceof Error ? error.message : "Failed to sign in";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default SignInController;
