import type DeleteFollowUseCase from "@src/application/usecases/follows/DeleteFollow.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const DeleteFollowController = (
  deleteFollowUseCase: DeleteFollowUseCase
): Controller =>
  createController({
    execute: async (req) => {
      await deleteFollowUseCase.execute({
        followId: requireObjectIdParam(req, "followId"),
        followerId: requireAuth(req).id,
      });
    },
    successMessage: "Follow supprimé avec succès",
  });

export default DeleteFollowController;
