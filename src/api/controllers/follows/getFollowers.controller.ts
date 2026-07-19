import type GetFollowersUseCase from "@src/application/usecases/follows/GetFollowers.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const GetFollowersController = (
  getFollowersUseCase: GetFollowersUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const followers = await getFollowersUseCase.execute({
        userId: requireObjectIdParam(req, "userId"),
      });
      return { followers };
    },
    successMessage: "Followers récupérés avec succès",
  });

export default GetFollowersController;
