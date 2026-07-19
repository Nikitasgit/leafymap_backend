import type GetFollowingUseCase from "@src/application/usecases/follows/GetFollowing.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const GetFollowingController = (
  getFollowingUseCase: GetFollowingUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const following = await getFollowingUseCase.execute({
        userId: requireObjectIdParam(req, "userId"),
      });
      return { following };
    },
    successMessage: "Following récupérés avec succès",
  });

export default GetFollowingController;
