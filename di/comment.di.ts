import {
  CommentRepository,
  ImageRepository,
  ReviewRepository,
  UserRepository,
} from "@/repositories";
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
import {
  AuthMiddleware,
  CommentsMiddleware,
  RateLimiterMiddleware,
} from "@/middlewares";

// Initialize repositories
const commentRepository = new CommentRepository();
const imageRepository = new ImageRepository();
const reviewRepository = new ReviewRepository();
const userRepository = new UserRepository();

// Initialize middlewares
export const authMiddleware = new AuthMiddleware(userRepository);
export const commentsMiddleware = new CommentsMiddleware(
  commentRepository,
  imageRepository,
  reviewRepository
);
export const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize actions
const createCommentAction = new CreateCommentAction(commentRepository);
const getCommentsAction = new GetCommentsAction(commentRepository);
const updateCommentAction = new UpdateCommentAction(commentRepository);
const deleteCommentAction = new DeleteCommentAction(commentRepository);

// Initialize controllers
export const createComment = new CreateCommentController(createCommentAction);
export const getComments = new GetCommentsController(getCommentsAction);
export const updateComment = new UpdateCommentController(updateCommentAction);
export const deleteComment = new DeleteCommentController(deleteCommentAction);
