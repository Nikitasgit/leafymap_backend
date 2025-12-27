import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { loginSchema } from "../../validations/authValidations";
import { ISignInAction } from "../../actions/auth/SignInAction";
import { setTokenCookie } from "../../utils/jwt";

class SignInController {
  constructor(private signInAction: ISignInAction) {}

  handle(): RequestHandler {
    return async (
      req: any,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const validationResult = loginSchema.safeParse(req.body);
        if (!validationResult.success) {
          const errors = validationResult.error.errors.reduce((acc, err) => {
            acc[err.path[0] as string] = err.message;
            return acc;
          }, {} as Record<string, string>);
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        const { user, token } = await this.signInAction.execute({
          signInData: validationResult.data,
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
