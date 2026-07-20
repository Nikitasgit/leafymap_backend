import { RequestHandler } from "express";
import {
  adminResourceSchema,
  adminSoftDeleteSchema,
} from "@src/api/dto/admin/admin.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type RestoreAdminResourceUseCase from "@src/application/usecases/admin/RestoreAdminResource.usecase";
import type SoftDeleteAdminResourceUseCase from "@src/application/usecases/admin/SoftDeleteAdminResource.usecase";

class AdminResourcesController extends BaseHttpController {
  constructor(
    private readonly softDeleteAdminResourceUseCase: SoftDeleteAdminResourceUseCase,
    private readonly restoreAdminResourceUseCase: RestoreAdminResourceUseCase
  ) {
    super();
  }

  delete(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const params = validateOrThrow(adminResourceSchema, req.params);
        const body = validateOrThrow(adminSoftDeleteSchema, req.body);
        await this.softDeleteAdminResourceUseCase.execute({
          adminId: requireAuth(req).id,
          resource: params.resource,
          resourceId: params.resourceId,
          reason: body.reason,
        });
      },
      successMessage: "Resource deleted successfully",
    });
  }

  restore(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const params = validateOrThrow(adminResourceSchema, req.params);
        const body = validateOrThrow(adminSoftDeleteSchema, req.body);
        await this.restoreAdminResourceUseCase.execute({
          adminId: requireAuth(req).id,
          resource: params.resource,
          resourceId: params.resourceId,
          reason: body.reason,
        });
      },
      successMessage: "Resource restored successfully",
    });
  }
}

export default AdminResourcesController;
