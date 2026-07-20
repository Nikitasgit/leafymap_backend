import { RequestHandler } from "express";
import {
  createCommentSchema,
  getCommentsQuerySchema,
  updateCommentSchema,
} from "@src/api/dto/comments/comment.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type CreateCommentUseCase from "@src/application/usecases/comments/CreateComment.usecase";
import type DeleteCommentUseCase from "@src/application/usecases/comments/DeleteComment.usecase";
import type GetCommentsUseCase from "@src/application/usecases/comments/GetComments.usecase";
import type UpdateCommentUseCase from "@src/application/usecases/comments/UpdateComment.usecase";

class CommentsController extends BaseHttpController {
  constructor(
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly getCommentsUseCase: GetCommentsUseCase,
    private readonly updateCommentUseCase: UpdateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase
  ) {
    super();
  }

  create(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const { content, reference, referenceType } = validateOrThrow(
          createCommentSchema,
          req.body
        );
        return this.createCommentUseCase.execute({
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
  }

  list(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const filters = validateOrThrow(getCommentsQuerySchema, req.query);
        const comments = await this.getCommentsUseCase.execute({
          referenceId: filters.reference,
          referenceType: filters.referenceType,
          authorId: filters.author,
        });
        return { comments };
      },
      successMessage: "Commentaires récupérés avec succès",
    });
  }

  update(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const { content } = validateOrThrow(updateCommentSchema, req.body);
        await this.updateCommentUseCase.execute({
          commentId: requireObjectIdParam(req, "commentId"),
          authorId: requireAuth(req).id,
          content,
        });
      },
      successMessage: "Commentaire modifié avec succès",
    });
  }

  delete(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        await this.deleteCommentUseCase.execute({
          commentId: requireObjectIdParam(req, "commentId"),
          authorId: requireAuth(req).id,
        });
      },
      successMessage: "Commentaire supprimé avec succès",
    });
  }
}

export default CommentsController;
