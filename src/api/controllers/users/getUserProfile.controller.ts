import type GetUserProfileUseCase from "@src/application/usecases/users/GetUserProfile.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const GetUserProfileController = (
  getUserProfileUseCase: GetUserProfileUseCase
): Controller =>
  createController({
    execute: (req) =>
      getUserProfileUseCase.execute({
        userId: requireObjectIdParam(req, "userId"),
      }),
    successMessage: "User profile fetched successfully",
  });

export default GetUserProfileController;
