import { asClass, AwilixContainer } from "awilix";
import CommentsController from "@src/api/controllers/CommentsController";
import CreateCommentUseCase from "@src/application/usecases/comments/CreateComment.usecase";
import DeleteCommentUseCase from "@src/application/usecases/comments/DeleteComment.usecase";
import GetCommentsUseCase from "@src/application/usecases/comments/GetComments.usecase";
import UpdateCommentUseCase from "@src/application/usecases/comments/UpdateComment.usecase";
import CommentReferenceCheckerAdapter from "@src/infrastructure/adapters/CommentReferenceChecker.adapter";
import type { Cradle } from "../cradle";

export const registerCommentsModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    referenceChecker: asClass(CommentReferenceCheckerAdapter).singleton(),
    createCommentUseCase: asClass(CreateCommentUseCase).singleton(),
    getCommentsUseCase: asClass(GetCommentsUseCase).singleton(),
    updateCommentUseCase: asClass(UpdateCommentUseCase).singleton(),
    deleteCommentUseCase: asClass(DeleteCommentUseCase).singleton(),

    commentsController: asClass(CommentsController).singleton(),
  });
};
