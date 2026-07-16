import { updateCommentSchema } from "@src/api/dto/comments/comment.dto";
import { IUpdateCommentUseCase } from "@src/application/usecases/comments/UpdateComment.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const UpdateCommentController = (
  updateCommentUseCase: IUpdateCommentUseCase
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
