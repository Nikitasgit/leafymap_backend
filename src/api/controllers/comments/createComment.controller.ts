import { createCommentSchema } from "@src/api/dto/comments/comment.dto";
import type CreateCommentUseCase from "@src/application/usecases/comments/CreateComment.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const CreateCommentController = (
  createCommentUseCase: CreateCommentUseCase
): Controller =>
  createController({
    execute: (req) => {
      const { content, reference, referenceType } = validateOrThrow(
        createCommentSchema,
        req.body
      );
      return createCommentUseCase.execute({
        authorId: requireAuth(req).id,
        content,
        referenceId: reference,
        referenceType,
      });
    },
    successMessage: "Commentaire créé avec succès",
    successStatus: 201,
    mapResult: (result) => ({ _id: result.id }),
  });

export default CreateCommentController;
