import { IFindFollowingUseCase } from "@src/application/usecases/follows/FindFollowing.usecase";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const FindFollowingController = (
  findFollowingUseCase: IFindFollowingUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const following = await findFollowingUseCase.execute({
        userId: requireObjectIdParam(req, "userId"),
      });
      return { following };
    },
    successMessage: "Following récupérés avec succès",
  });

export default FindFollowingController;
