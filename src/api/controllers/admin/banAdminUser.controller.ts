import { adminBanUserSchema } from "@src/api/dto/admin/admin.dto";
import type BanAdminUserUseCase from "@src/application/usecases/admin/BanAdminUser.usecase";
import type UnbanAdminUserUseCase from "@src/application/usecases/admin/UnbanAdminUser.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const banController = (banAdminUserUseCase: BanAdminUserUseCase): Controller =>
  createController({
    execute: async (req) => {
      const body = validateOrThrow(adminBanUserSchema, req.body);
      await banAdminUserUseCase.execute({
        adminId: requireAuth(req).id,
        userId: requireObjectIdParam(req, "userId"),
        reason: body.reason,
        duration: body.duration,
      });
    },
    successMessage: "User banned successfully",
  });

const unbanController = (
  unbanAdminUserUseCase: UnbanAdminUserUseCase
): Controller =>
  createController({
    execute: async (req) => {
      await unbanAdminUserUseCase.execute({
        adminId: requireAuth(req).id,
        userId: requireObjectIdParam(req, "userId"),
      });
    },
    successMessage: "User unbanned successfully",
  });

const BanAdminUserController = (
  banAdminUserUseCase: BanAdminUserUseCase,
  unbanAdminUserUseCase: UnbanAdminUserUseCase
) => ({
  ban: () => banController(banAdminUserUseCase).handle(),
  unban: () => unbanController(unbanAdminUserUseCase).handle(),
});

export default BanAdminUserController;
