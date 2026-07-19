import { updateCommentSchema } from "@src/api/dto/comments/comment.dto";
import type UpdateCommentUseCase from "@src/application/usecases/comments/UpdateComment.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const UpdateCommentController = (
  updateCommentUseCase: UpdateCommentUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const { content } = validateOrThrow(updateCommentSchema, req.body);
      await updateCommentUseCase.execute({
        commentId: requireObjectIdParam(req, "commentId"),
        authorId: requireAuth(req).id,
        content,
      });
    },
    successMessage: "Commentaire modifié avec succès",
  });

export default UpdateCommentController;
