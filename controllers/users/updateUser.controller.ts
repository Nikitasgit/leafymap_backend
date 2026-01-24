import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { newCreatorSchema } from "../../validations/user.validations";
import { IUpdateUserAction } from "@/actions/users";
import { setTokenCookie } from "@/utils/jwt";
import { validateData } from "@/utils/validation";

class UpdateUserController {
  constructor(private updateUserAction: IUpdateUserAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;

        if (req.body.userType === "creator") {
          const errors = validateData(newCreatorSchema, req.body);
          if (errors) {
            APIResponse(res, errors, "Validation error", 400);
            return;
          }
        }

        const { token } = await this.updateUserAction.execute({
          userId: decoded.id,
          updateData: req.body,
        });

        setTokenCookie(res, token);
        APIResponse(res, null, "User updated successfully", 200);
      } catch (error) {
        logger.error("Error updating user:", error);
        APIResponse(res, null, "Server error", 500);
      }
    };
  }
}

export default UpdateUserController;
