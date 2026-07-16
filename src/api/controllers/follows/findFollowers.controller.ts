import { IFindFollowersUseCase } from "@src/application/usecases/follows/FindFollowers.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const FindFollowersController = (
  findFollowersUseCase: IFindFollowersUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const followers = await findFollowersUseCase.execute({
        userId: requireObjectIdParam(req, "userId"),
      });
      return { followers };
    },
    successMessage: "Followers récupérés avec succès",
  });

export default FindFollowersController;
