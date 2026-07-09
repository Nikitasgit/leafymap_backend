import { ISoftDeleteAdminUserAction } from "@/actions/admin/SoftDeleteAdminUser.action";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const softDeleteUserController = (
  action: ISoftDeleteAdminUserAction,
  deleted: boolean,
  successMessage: string
): Controller =>
  createController({
    execute: async (req) => {
      await action.execute({
        adminId: requireAuth(req).id,
        userId: requireObjectIdParam(req, "userId"),
        deleted,
      });
    },
    successMessage,
  });

const SoftDeleteAdminUserController = (action: ISoftDeleteAdminUserAction) => ({
  delete: () =>
    softDeleteUserController(action, true, "User deleted successfully").handle(),
  restore: () =>
    softDeleteUserController(
      action,
      false,
      "User restored successfully"
    ).handle(),
});

export default SoftDeleteAdminUserController;
