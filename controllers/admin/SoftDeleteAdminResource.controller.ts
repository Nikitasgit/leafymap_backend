import { RequestHandler, Response } from "express";
import { CustomRequest } from "@/types/custom";
import {
  AdminResource,
  ISoftDeleteAdminResourceAction,
} from "@/actions/admin/SoftDeleteAdminResource.action";
import {
  adminResourceSchema,
  adminSoftDeleteSchema,
} from "@/validations/admin.validations";
import { APIResponse } from "@/utils/response";

class SoftDeleteAdminResourceController {
  constructor(private action: ISoftDeleteAdminResourceAction) {}

  delete(): RequestHandler {
    return this.handle(true, "Resource deleted successfully");
  }

  restore(): RequestHandler {
    return this.handle(false, "Resource restored successfully");
  }

  private handle(deleted: boolean, successMessage: string): RequestHandler {
    return async (req: CustomRequest, res: Response): Promise<void> => {
      try {
        const params = adminResourceSchema.parse(req.params);
        const body = adminSoftDeleteSchema.parse(req.body);

        await this.action.execute({
          adminId: req.decoded!.id,
          resource: params.resource as AdminResource,
          resourceId: params.resourceId,
          deleted,
          reason: body.reason,
        });

        APIResponse(res, null, successMessage, 200);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Action failed";
        APIResponse(res, null, message, 400);
      }
    };
  }
}

export default SoftDeleteAdminResourceController;
