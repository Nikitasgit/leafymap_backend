import { getUsersQuerySchema } from "@src/api/dto/users/user.dto";
import type GetUsersUseCase from "@src/application/usecases/users/GetUsers.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetUsersController = (getUsersUseCase: GetUsersUseCase): Controller =>
  createController({
    execute: (req) =>
      getUsersUseCase.execute({
        filters: validateOrThrow(getUsersQuerySchema, req.query),
      }),
    successMessage: "Users fetched successfully",
  });

export default GetUsersController;
