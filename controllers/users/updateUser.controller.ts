import { Response, NextFunction, RequestHandler } from "express";
import { CustomRequest } from "@/types/custom";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { newCreatorSchema } from "../../validations/user.validations";
import { IUpdateUserAction } from "@/actions/users";
import { setTokenCookie } from "@/utils/jwt";
import { IUser } from "@/types/models/user";

class UpdateUserController {
  constructor(private updateUserAction: IUpdateUserAction) {}

  handle(): RequestHandler {
    return async (
      req: CustomRequest,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      try {
        const decoded = req.decoded!;

        let updateData: Partial<IUser> = req.body;
        if (req.body.userType === "creator") {
          const parseResult = newCreatorSchema.safeParse(req.body);
          if (!parseResult.success && parseResult.error?.issues) {
            const errors = parseResult.error.issues.reduce(
              (acc, err) => {
                acc[err.path[0] as string] = err.message;
                return acc;
              },
              {} as Record<string, string>
            );
            APIResponse(res, errors, "Validation error", 400);
            return;
          }
          if (parseResult.success && parseResult.data) {
            const parsed = parseResult.data;
            updateData = Object.fromEntries(
              Object.entries(parsed).filter(([, v]) => v !== undefined)
            ) as Partial<IUser>;
          }
        }

        if (!decoded.id) {
          APIResponse(res, null, "Unauthorized", 401);
          return;
        }
        const result = await this.updateUserAction.execute({
          userId: decoded.id as string,
          updateData,
        });

        if (result.token) {
          setTokenCookie(res, result.token);
        }
        APIResponse(res, null, "User updated successfully", 200);
      } catch (error) {
        logger.error("Error updating user:", error);
        APIResponse(res, null, "Server error", 500);
      }
    };
  }
}

export default UpdateUserController;
