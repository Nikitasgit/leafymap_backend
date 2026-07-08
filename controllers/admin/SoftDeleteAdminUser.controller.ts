import { RequestHandler, Response } from "express";
import { CustomRequest } from "@/types/custom";
import { ISoftDeleteAdminUserAction } from "@/actions/admin/SoftDeleteAdminUser.action";
import { APIResponse } from "@/utils/response";
import { getParam } from "@/utils/request";

class SoftDeleteAdminUserController {
  constructor(private action: ISoftDeleteAdminUserAction) {}

  delete(): RequestHandler {
    return this.handle(true, "User deleted successfully");
  }

  restore(): RequestHandler {
    return this.handle(false, "User restored successfully");
  }

  private handle(deleted: boolean, successMessage: string): RequestHandler {
    return async (req: CustomRequest, res: Response): Promise<void> => {
      try {
        const userId = getParam(req.params, "userId");
        if (!userId) {
          APIResponse(res, null, "User ID is required", 400);
          return;
        }
        await this.action.execute({
          adminId: req.decoded!.id,
          userId,
          deleted,
        });
        APIResponse(res, null, successMessage, 200);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Action failed";
        APIResponse(res, null, message, 400);
      }
    };
  }
}

export default SoftDeleteAdminUserController;
