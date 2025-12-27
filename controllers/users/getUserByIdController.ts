import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "../../utils/response";
import logger from "../../utils/logger";
import { IGetUserByIdAction } from "../../actions/users/GetUserByIdAction";

class GetUserByIdController {
  constructor(private getUserByIdAction: IGetUserByIdAction) {}

  handle(): RequestHandler {
    return async (
      req: any,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const userId = req.params.userId;
        const user = await this.getUserByIdAction.execute({ userId });

        APIResponse(res, { user }, "User fetched successfully", 200);
      } catch (error) {
        logger.error("Error getting user:", error);
        const message = error instanceof Error ? error.message : "Server error";
        APIResponse(res, null, message, 500);
      }
    };
  }
}

export default GetUserByIdController;
