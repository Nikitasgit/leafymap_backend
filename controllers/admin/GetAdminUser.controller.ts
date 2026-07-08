import { RequestHandler, Response } from "express";
import { IGetAdminUserAction } from "@/actions/admin/GetAdminUser.action";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";

class GetAdminUserController {
  constructor(private action: IGetAdminUserAction) {}

  handle(): RequestHandler {
    return async (req, res: Response): Promise<void> => {
      try {
        const userId = getParam(req.params, "userId");
        if (!userId) {
          APIResponse(res, null, "User ID is required", 400);
          return;
        }
        const user = await this.action.execute({ userId });
        APIResponse(res, { user }, "User retrieved successfully", 200);
      } catch (error) {
        APIResponse(res, null, "User not found", 404);
      }
    };
  }
}

export default GetAdminUserController;
