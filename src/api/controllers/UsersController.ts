import { RequestHandler } from "express";
import { getUsersQuerySchema, newCreatorSchema } from "@src/api/dto/users/user.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type DeleteAccountUseCase from "@src/application/usecases/users/DeleteAccount.usecase";
import type GetUserByIdUseCase from "@src/application/usecases/users/GetUserById.usecase";
import type GetUserProfileUseCase from "@src/application/usecases/users/GetUserProfile.usecase";
import type GetUsersUseCase from "@src/application/usecases/users/GetUsers.usecase";
import type UpdateUserUseCase from "@src/application/usecases/users/UpdateUser.usecase";
import { setTokenCookie } from "@src/api/http/cookies";

class UsersController extends BaseHttpController {
  constructor(
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUserProfileUseCase: GetUserProfileUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteAccountUseCase: DeleteAccountUseCase
  ) {
    super();
  }

  list(): RequestHandler {
    return this.handler({
      execute: (req) =>
        this.getUsersUseCase.execute({
          filters: validateOrThrow(getUsersQuerySchema, req.query),
        }),
      successMessage: "Users fetched successfully",
    });
  }

  getById(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const user = await this.getUserByIdUseCase.execute({
          userId: requireObjectIdParam(req, "userId"),
        });
        return { user };
      },
      successMessage: "User fetched successfully",
    });
  }

  getProfile(): RequestHandler {
    return this.handler({
      execute: (req) =>
        this.getUserProfileUseCase.execute({
          userId: requireObjectIdParam(req, "userId"),
        }),
      successMessage: "User profile fetched successfully",
    });
  }

  update(): RequestHandler {
    return this.handler({
      execute: async (req, res) => {
        let updateData = req.body as Record<string, unknown>;
        if (req.body.userType === "creator") {
          const parsed = validateOrThrow(newCreatorSchema, req.body);
          updateData = Object.fromEntries(
            Object.entries(parsed).filter(([, v]) => v !== undefined)
          );
        }

        const result = await this.updateUserUseCase.execute({
          userId: requireAuth(req).id,
          updateData,
        });

        if (result.token) {
          setTokenCookie(res, result.token);
        }
      },
      successMessage: "User updated successfully",
    });
  }

  deleteAccount(): RequestHandler {
    return this.handler({
      execute: async (req, res) => {
        await this.deleteAccountUseCase.execute({
          userId: requireAuth(req).id,
        });
        res.clearCookie("token");
      },
      successMessage: "Account and all associated data deleted successfully",
    });
  }
}

export default UsersController;
