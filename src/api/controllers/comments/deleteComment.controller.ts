import type DeleteCommentUseCase from "@src/application/usecases/comments/DeleteComment.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const DeleteCommentController = (
  deleteCommentUseCase: DeleteCommentUseCase
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
