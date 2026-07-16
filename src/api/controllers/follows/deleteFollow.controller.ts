import { IDeleteFollowUseCase } from "@src/application/usecases/follows/DeleteFollow.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const DeleteFollowController = (
  deleteFollowUseCase: IDeleteFollowUseCase
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
