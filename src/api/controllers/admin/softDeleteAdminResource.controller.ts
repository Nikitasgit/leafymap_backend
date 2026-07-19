import {
  adminResourceSchema,
  adminSoftDeleteSchema,
} from "@src/api/dto/admin/admin.dto";
import type RestoreAdminResourceUseCase from "@src/application/usecases/admin/RestoreAdminResource.usecase";
import type SoftDeleteAdminResourceUseCase from "@src/application/usecases/admin/SoftDeleteAdminResource.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const softDeleteResourceController = (
  softDeleteAdminResourceUseCase: SoftDeleteAdminResourceUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const params = validateOrThrow(adminResourceSchema, req.params);
      const body = validateOrThrow(adminSoftDeleteSchema, req.body);
      await softDeleteAdminResourceUseCase.execute({
        adminId: requireAuth(req).id,
        resource: params.resource,
        resourceId: params.resourceId,
        reason: body.reason,
      });
    },
    successMessage: "Resource deleted successfully",
  });

const restoreResourceController = (
  restoreAdminResourceUseCase: RestoreAdminResourceUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const params = validateOrThrow(adminResourceSchema, req.params);
      const body = validateOrThrow(adminSoftDeleteSchema, req.body);
      await restoreAdminResourceUseCase.execute({
        adminId: requireAuth(req).id,
        resource: params.resource,
        resourceId: params.resourceId,
        reason: body.reason,
      });
    },
    successMessage: "Resource restored successfully",
  });

const SoftDeleteAdminResourceController = (
  softDeleteAdminResourceUseCase: SoftDeleteAdminResourceUseCase,
  restoreAdminResourceUseCase: RestoreAdminResourceUseCase
) => ({
  delete: () =>
    softDeleteResourceController(softDeleteAdminResourceUseCase).handle(),
  restore: () =>
    restoreResourceController(restoreAdminResourceUseCase).handle(),
});

export default SoftDeleteAdminResourceController;
