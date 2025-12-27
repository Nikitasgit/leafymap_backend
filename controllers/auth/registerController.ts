import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { registerSchema } from "../../validations/authValidations";
import { IRegisterAction } from "../../actions/auth/RegisterAction";

class RegisterController {
  constructor(private registerAction: IRegisterAction) {}

  handle(): RequestHandler {
    return async (
      req: any,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const validationResult = registerSchema.safeParse(req.body);
        if (!validationResult.success) {
          const errors = validationResult.error.errors.reduce((acc, err) => {
            acc[err.path[0] as string] = err.message;
            return acc;
          }, {} as Record<string, string>);
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }

        await this.registerAction.execute({
          registerData: validationResult.data,
        });

        APIResponse(res, null, "User registered", 201);
      } catch (error) {
        logger.error("Error in register:", error);
        const message =
          error instanceof Error ? error.message : "Failed to register";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default RegisterController;
