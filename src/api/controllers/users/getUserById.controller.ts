import type GetUserByIdUseCase from "@src/application/usecases/users/GetUserById.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const GetUserByIdController = (
  getUserByIdUseCase: GetUserByIdUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const user = await getUserByIdUseCase.execute({
        userId: requireObjectIdParam(req, "userId"),
      });
      return { user };
    },
    successMessage: "User fetched successfully",
  });

export default GetUserByIdController;
