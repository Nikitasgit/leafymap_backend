import {
  AdminResource,
  ISoftDeleteAdminResourceAction,
} from "@/actions/admin/SoftDeleteAdminResource.action";
import {
  adminResourceSchema,
  adminSoftDeleteSchema,
} from "@/validations/admin.validations";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const softDeleteResourceController = (
  action: ISoftDeleteAdminResourceAction,
  deleted: boolean,
  successMessage: string
): Controller =>
  createController({
    execute: async (req) => {
      const params = validateOrThrow(adminResourceSchema, req.params);
      const body = validateOrThrow(adminSoftDeleteSchema, req.body);
      await action.execute({
        adminId: requireAuth(req).id,
        resource: params.resource as AdminResource,
        resourceId: params.resourceId,
        deleted,
        reason: body.reason,
      });
    },
    successMessage,
  });

const SoftDeleteAdminResourceController = (
  action: ISoftDeleteAdminResourceAction
) => ({
  delete: () =>
    softDeleteResourceController(
      action,
      true,
      "Resource deleted successfully"
    ).handle(),
  restore: () =>
    softDeleteResourceController(
      action,
      false,
      "Resource restored successfully"
    ).handle(),
});

export default SoftDeleteAdminResourceController;
