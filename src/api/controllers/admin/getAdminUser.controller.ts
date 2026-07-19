import type GetAdminUserUseCase from "@src/application/usecases/admin/GetAdminUser.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const GetAdminUserController = (
  getAdminUserUseCase: GetAdminUserUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const user = await getAdminUserUseCase.execute({
        userId: requireObjectIdParam(req, "userId"),
      });
      return { user };
    },
    successMessage: "User retrieved successfully",
  });

export default GetAdminUserController;
