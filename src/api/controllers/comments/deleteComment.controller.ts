import { IDeleteCommentUseCase } from "@src/application/usecases/comments/DeleteComment.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const DeleteCommentController = (
  deleteCommentUseCase: IDeleteCommentUseCase
): Controller =>
  createController({
    execute: async (req) => {
      await deleteCommentUseCase.execute({
        commentId: requireObjectIdParam(req, "commentId"),
        authorId: requireAuth(req).id,
      });
    },
    successMessage: "Commentaire supprimé avec succès",
  });

export default DeleteCommentController;
