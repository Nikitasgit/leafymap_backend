import CreateCommentUseCase from "@src/application/usecases/comments/CreateComment.usecase";
import GetCommentsUseCase from "@src/application/usecases/comments/GetComments.usecase";
import UpdateCommentUseCase from "@src/application/usecases/comments/UpdateComment.usecase";
import DeleteCommentUseCase from "@src/application/usecases/comments/DeleteComment.usecase";
import CreateCommentController from "@src/api/controllers/comments/createComment.controller";
import GetCommentsController from "@src/api/controllers/comments/getComments.controller";
import UpdateCommentController from "@src/api/controllers/comments/updateComment.controller";
import DeleteCommentController from "@src/api/controllers/comments/deleteComment.controller";
import LegacyCommentReferenceCheckerAdapter from "@src/infrastructure/adapters/LegacyCommentReferenceChecker.adapter";
import {
  authMiddleware,
  imageRepository,
  mongooseCommentRepository,
  mongooseReviewRepository,
  rateLimiterMiddleware,
} from "@/di/container";

const commentReferenceChecker = new LegacyCommentReferenceCheckerAdapter(
  imageRepository,
  mongooseReviewRepository
);

const createCommentUseCase = new CreateCommentUseCase(
  mongooseCommentRepository,
  commentReferenceChecker
);
const getCommentsUseCase = new GetCommentsUseCase(mongooseCommentRepository);
const updateCommentUseCase = new UpdateCommentUseCase(mongooseCommentRepository);
const deleteCommentUseCase = new DeleteCommentUseCase(mongooseCommentRepository);

export { authMiddleware, rateLimiterMiddleware };

export const createComment = CreateCommentController(createCommentUseCase);
export const getComments = GetCommentsController(getCommentsUseCase);
export const updateComment = UpdateCommentController(updateCommentUseCase);
export const deleteComment = DeleteCommentController(deleteCommentUseCase);
