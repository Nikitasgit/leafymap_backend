import { updateCommentSchema } from "../../validations/comment.validations";
import { IUpdateCommentAction } from "@/actions/comments";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const UpdateCommentController = (
  updateCommentAction: IUpdateCommentAction
): Controller =>
  createController({
    execute: async (req) => {
      requireAuth(req);
      await updateCommentAction.execute({
        commentId: requireObjectIdParam(req, "commentId"),
        commentData: validateOrThrow(updateCommentSchema, req.body),
      });
    },
    successMessage: "Commentaire modifié avec succès",
  });

export default UpdateCommentController;
