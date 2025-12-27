import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "../../types/custom";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { validateNewUserData } from "../../validations/userValidations";
import { IUpdateUserAction } from "../../actions/users/UpdateUserAction";
import { setTokenCookie } from "../../utils/jwt";

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

        const validationResult = validateNewUserData(req.body);
        if (!validationResult.isValid) {
          APIResponse(res, validationResult.errors, "Validation error", 400);
          return;
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
