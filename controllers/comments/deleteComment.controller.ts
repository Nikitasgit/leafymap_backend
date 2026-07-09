import { IDeleteCommentAction } from "@/actions/comments";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const DeleteCommentController = (
  deleteCommentAction: IDeleteCommentAction
): Controller =>
  createController({
    execute: async (req) => {
      requireAuth(req);
      await deleteCommentAction.execute({
        commentId: requireObjectIdParam(req, "commentId"),
      });
    },
    successMessage: "Commentaire supprimé avec succès",
  });

export default DeleteCommentController;
