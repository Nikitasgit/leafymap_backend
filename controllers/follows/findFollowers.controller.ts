import { IFindFollowersAction } from "@/actions/follows";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const FindFollowersController = (
  findFollowersAction: IFindFollowersAction
): Controller =>
  createController({
    execute: async (req) => {
      const followers = await findFollowersAction.execute({
        userId: requireObjectIdParam(req, "userId"),
      });
      return { followers };
    },
    successMessage: "Followers récupérés avec succès",
  });

export default FindFollowersController;
