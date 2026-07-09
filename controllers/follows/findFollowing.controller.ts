import { IFindFollowingAction } from "@/actions/follows";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const FindFollowingController = (
  findFollowingAction: IFindFollowingAction
): Controller =>
  createController({
    execute: async (req) => {
      const following = await findFollowingAction.execute({
        userId: requireObjectIdParam(req, "userId"),
      });
      return { following };
    },
    successMessage: "Following récupérés avec succès",
  });

export default FindFollowingController;
