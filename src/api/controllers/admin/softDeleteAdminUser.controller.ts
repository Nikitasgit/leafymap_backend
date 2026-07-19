import type RestoreAdminUserUseCase from "@src/application/usecases/admin/RestoreAdminUser.usecase";
import type SoftDeleteAdminUserUseCase from "@src/application/usecases/admin/SoftDeleteAdminUser.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const softDeleteUserController = (
  softDeleteAdminUserUseCase: SoftDeleteAdminUserUseCase
): Controller =>
  createController({
    execute: async (req) => {
      await softDeleteAdminUserUseCase.execute({
        adminId: requireAuth(req).id,
        userId: requireObjectIdParam(req, "userId"),
      });
    },
    successMessage: "User deleted successfully",
  });

const restoreUserController = (
  restoreAdminUserUseCase: RestoreAdminUserUseCase
): Controller =>
  createController({
    execute: async (req) => {
      await restoreAdminUserUseCase.execute({
        adminId: requireAuth(req).id,
        userId: requireObjectIdParam(req, "userId"),
      });
    },
    successMessage: "User restored successfully",
  });

const SoftDeleteAdminUserController = (
  softDeleteAdminUserUseCase: SoftDeleteAdminUserUseCase,
  restoreAdminUserUseCase: RestoreAdminUserUseCase
) => ({
  delete: () => softDeleteUserController(softDeleteAdminUserUseCase).handle(),
  restore: () => restoreUserController(restoreAdminUserUseCase).handle(),
});

export default SoftDeleteAdminUserController;
