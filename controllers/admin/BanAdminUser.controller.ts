import { RequestHandler, Response } from "express";
import { CustomRequest } from "@/types/custom";
import { IBanAdminUserAction } from "@/actions/admin/BanAdminUser.action";
import { adminBanUserSchema } from "@/validations/admin.validations";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";

class BanAdminUserController {
  constructor(private action: IBanAdminUserAction) {}

  ban(): RequestHandler {
    return async (req: CustomRequest, res: Response): Promise<void> => {
      try {
        const body = adminBanUserSchema.parse(req.body);
        const userId = getParam(req.params, "userId");
        if (!userId) {
          APIResponse(res, null, "User ID is required", 400);
          return;
        }
        await this.action.ban({
          adminId: req.decoded!.id,
          userId,
          reason: body.reason,
          duration: body.duration,
        });
        APIResponse(res, null, "User banned successfully", 200);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Ban failed";
        APIResponse(res, null, message, 400);
      }
    };
  }

  unban(): RequestHandler {
    return async (req: CustomRequest, res: Response): Promise<void> => {
      try {
        const userId = getParam(req.params, "userId");
        if (!userId) {
          APIResponse(res, null, "User ID is required", 400);
          return;
        }
        await this.action.unban({
          adminId: req.decoded!.id,
          userId,
        });
        APIResponse(res, null, "User unbanned successfully", 200);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unban failed";
        APIResponse(res, null, message, 400);
      }
    };
  }
}

export default BanAdminUserController;
