import { IBanAdminUserAction } from "@/actions/admin/BanAdminUser.action";
import { adminBanUserSchema } from "@/validations/admin.validations";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const banController = (action: IBanAdminUserAction): Controller =>
  createController({
    execute: async (req) => {
      const body = validateOrThrow(adminBanUserSchema, req.body);
      await action.ban({
        adminId: requireAuth(req).id,
        userId: requireObjectIdParam(req, "userId"),
        reason: body.reason,
        duration: body.duration,
      });
    },
    successMessage: "User banned successfully",
  });

const unbanController = (action: IBanAdminUserAction): Controller =>
  createController({
    execute: async (req) => {
      await action.unban({
        adminId: requireAuth(req).id,
        userId: requireObjectIdParam(req, "userId"),
      });
    },
    successMessage: "User unbanned successfully",
  });

const BanAdminUserController = (action: IBanAdminUserAction) => ({
  ban: () => banController(action).handle(),
  unban: () => unbanController(action).handle(),
});

export default BanAdminUserController;
