import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { registerSchema } from "../../validations/auth.validations";
import { IRegisterAction } from "@/actions/auth";
import { validateData } from "@/utils/validation";

class RegisterController {
  constructor(private registerAction: IRegisterAction) {}

  handle(): RequestHandler {
    return async (
      req: any,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const errors = validateData(registerSchema, req.body);
        if (errors) {
          APIResponse(res, errors, "Validation failed", 400);
          return;
        }
        await this.registerAction.execute({
          registerData: registerSchema.parse(req.body),
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
