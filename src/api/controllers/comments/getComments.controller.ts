import { getCommentsQuerySchema } from "@src/api/dto/comments/comment.dto";
import type GetCommentsUseCase from "@src/application/usecases/comments/GetComments.usecase";
import {
  Controller,
  createController,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const GetCommentsController = (
  getCommentsUseCase: GetCommentsUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const filters = validateOrThrow(getCommentsQuerySchema, req.query);
      const comments = await getCommentsUseCase.execute({
        referenceId: filters.reference,
        referenceType: filters.referenceType,
        authorId: filters.author,
      });
      return { comments };
    },
    successMessage: "Commentaires récupérés avec succès",
  });

export default GetCommentsController;
