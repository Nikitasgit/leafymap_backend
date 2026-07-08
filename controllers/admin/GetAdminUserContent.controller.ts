import { RequestHandler, Response } from "express";
import { IGetAdminUserContentAction } from "@/actions/admin/GetAdminUserContent.action";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";

class GetAdminUserContentController {
  constructor(private action: IGetAdminUserContentAction) {}

  handle(): RequestHandler {
    return async (req, res: Response): Promise<void> => {
      try {
        const userId = getParam(req.params, "userId");
        if (!userId) {
          APIResponse(res, null, "User ID is required", 400);
          return;
        }
        const content = await this.action.execute({ userId });
        APIResponse(res, { content }, "User content retrieved successfully", 200);
      } catch (error) {
        APIResponse(res, null, "Failed to retrieve user content", 500);
      }
    };
  }
}

export default GetAdminUserContentController;
