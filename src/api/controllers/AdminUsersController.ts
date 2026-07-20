import { RequestHandler } from "express";
import { adminBanUserSchema, adminUserSearchSchema } from "@src/api/dto/admin/admin.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type BanAdminUserUseCase from "@src/application/usecases/admin/BanAdminUser.usecase";
import type GetAdminUserContentUseCase from "@src/application/usecases/admin/GetAdminUserContent.usecase";
import type GetAdminUserUseCase from "@src/application/usecases/admin/GetAdminUser.usecase";
import type RestoreAdminUserUseCase from "@src/application/usecases/admin/RestoreAdminUser.usecase";
import type SearchAdminUsersUseCase from "@src/application/usecases/admin/SearchAdminUsers.usecase";
import type SoftDeleteAdminUserUseCase from "@src/application/usecases/admin/SoftDeleteAdminUser.usecase";
import type UnbanAdminUserUseCase from "@src/application/usecases/admin/UnbanAdminUser.usecase";

class AdminUsersController extends BaseHttpController {
  constructor(
    private readonly searchAdminUsersUseCase: SearchAdminUsersUseCase,
    private readonly getAdminUserUseCase: GetAdminUserUseCase,
    private readonly getAdminUserContentUseCase: GetAdminUserContentUseCase,
    private readonly banAdminUserUseCase: BanAdminUserUseCase,
    private readonly unbanAdminUserUseCase: UnbanAdminUserUseCase,
    private readonly softDeleteAdminUserUseCase: SoftDeleteAdminUserUseCase,
    private readonly restoreAdminUserUseCase: RestoreAdminUserUseCase
  ) {
    super();
  }

  search(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const { email } = validateOrThrow(adminUserSearchSchema, req.query);
        const users = await this.searchAdminUsersUseCase.execute({ email });
        return { users };
      },
      successMessage: "Users retrieved successfully",
    });
  }

  getById(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const user = await this.getAdminUserUseCase.execute({
          userId: requireObjectIdParam(req, "userId"),
        });
        return { user };
      },
      successMessage: "User retrieved successfully",
    });
  }

  getContent(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const content = await this.getAdminUserContentUseCase.execute({
          userId: requireObjectIdParam(req, "userId"),
        });
        return { content };
      },
      successMessage: "User content retrieved successfully",
    });
  }

  ban(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const body = validateOrThrow(adminBanUserSchema, req.body);
        await this.banAdminUserUseCase.execute({
          adminId: requireAuth(req).id,
          userId: requireObjectIdParam(req, "userId"),
          reason: body.reason,
          duration: body.duration,
        });
      },
      successMessage: "User banned successfully",
    });
  }

  unban(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.unbanAdminUserUseCase.execute({
          adminId: requireAuth(req).id,
          userId: requireObjectIdParam(req, "userId"),
        });
      },
      successMessage: "User unbanned successfully",
    });
  }

  delete(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.softDeleteAdminUserUseCase.execute({
          adminId: requireAuth(req).id,
          userId: requireObjectIdParam(req, "userId"),
        });
      },
      successMessage: "User deleted successfully",
    });
  }

  restore(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.restoreAdminUserUseCase.execute({
          adminId: requireAuth(req).id,
          userId: requireObjectIdParam(req, "userId"),
        });
      },
      successMessage: "User restored successfully",
    });
  }
}

export default AdminUsersController;
