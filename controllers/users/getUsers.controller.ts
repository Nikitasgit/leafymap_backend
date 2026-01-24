import { Response, NextFunction, RequestHandler } from "express";
import { APIResponse } from "@/utils/response";
import logger from "@/utils/logger";
import { IGetUsersAction, GetUsersInput } from "@/actions/users";

class GetUsersController {
  constructor(private getUsersAction: IGetUsersAction) {}

  handle(): RequestHandler {
    return async (
      req: any,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const { username, limit, excludeIds } = req.query;
        const filters: GetUsersInput = {};

        if (username && typeof username === "string") {
          filters.username = username;
        }
        if (limit) {
          filters.limit = parseInt(limit as string);
        }
        if (excludeIds) {
          filters.excludeIds = Array.isArray(excludeIds)
            ? excludeIds
            : [excludeIds];
        }

        const users = await this.getUsersAction.execute({ filters });

        APIResponse(res, users, "Users fetched successfully", 200);
      } catch (error) {
        logger.error("Error finding users:", error);
        APIResponse(res, null, "Server error", 500);
      }
    };
  }
}

export default GetUsersController;
