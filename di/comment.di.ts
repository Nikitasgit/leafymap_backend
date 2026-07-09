import {
  commentRepository,
  imageRepository,
  reviewRepository,
  authMiddleware as sharedAuthMiddleware,
  rateLimiterMiddleware as sharedRateLimiterMiddleware,
} from "./container";
import {
  CreateCommentAction,
  GetCommentsAction,
  UpdateCommentAction,
  DeleteCommentAction,
} from "@/actions/comments";
import {
  CreateCommentController,
  GetCommentsController,
  UpdateCommentController,
  DeleteCommentController,
} from "@/controllers/comments";
import { CommentsMiddleware } from "@/middlewares";

// Middlewares
export const authMiddleware = sharedAuthMiddleware;
export const commentsMiddleware = new CommentsMiddleware(
  commentRepository,
  imageRepository,
  reviewRepository
);
export const rateLimiterMiddleware = sharedRateLimiterMiddleware;

// Actions
const createCommentAction = new CreateCommentAction(commentRepository);
const getCommentsAction = new GetCommentsAction(commentRepository);
const updateCommentAction = new UpdateCommentAction(commentRepository);
const deleteCommentAction = new DeleteCommentAction(commentRepository);

// Controllers
export const createComment = CreateCommentController(createCommentAction);
export const getComments = GetCommentsController(getCommentsAction);
export const updateComment = UpdateCommentController(updateCommentAction);
export const deleteComment = DeleteCommentController(deleteCommentAction);
