import { IDeleteFollowAction } from "@/actions/follows";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const DeleteFollowController = (
  deleteFollowAction: IDeleteFollowAction
): Controller =>
  createController({
    execute: async (req) => {
      await deleteFollowAction.execute({
        followId: requireObjectIdParam(req, "followId"),
        followerId: requireAuth(req).id,
      });
    },
    successMessage: "Follow supprimé avec succès",
  });

export default DeleteFollowController;
