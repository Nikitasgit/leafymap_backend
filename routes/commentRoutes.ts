import express, { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import CommentsMiddleware from "../middlewares/CommentsMiddleware";
import RateLimiterMiddleware from "../middlewares/RateLimiterMiddleware";
import CreateCommentAction from "../actions/comments/CreateCommentAction";
import GetCommentsAction from "../actions/comments/GetCommentsAction";
import UpdateCommentAction from "../actions/comments/UpdateCommentAction";
import DeleteCommentAction from "../actions/comments/DeleteCommentAction";
import MongooseCommentRepository from "../repositories/comments/MongooseCommentRepository";
import MongooseImageRepository from "../repositories/images/MongooseImageRepository";
import MongooseReviewRepository from "../repositories/reviews/MongooseReviewRepository";
import MongooseUserRepository from "../repositories/users/MongooseUserRepository";
import CreateCommentController from "../controllers/comments/createCommentController";
import GetCommentsController from "../controllers/comments/getCommentsController";
import UpdateCommentController from "../controllers/comments/updateCommentController";
import DeleteCommentController from "../controllers/comments/deleteCommentController";
// Initialize repositories
const commentRepository = new MongooseCommentRepository();
const imageRepository = new MongooseImageRepository();
const reviewRepository = new MongooseReviewRepository();
const userRepository = new MongooseUserRepository();

const authMiddleware = new AuthMiddleware(userRepository);
const commentsMiddleware = new CommentsMiddleware(
  commentRepository,
  imageRepository,
  reviewRepository
);
const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize actions
const createCommentAction = new CreateCommentAction(commentRepository);
const getCommentsAction = new GetCommentsAction(commentRepository);
const updateCommentAction = new UpdateCommentAction(commentRepository);
const deleteCommentAction = new DeleteCommentAction(commentRepository);

// Initialize controllers
const createCommentController = new CreateCommentController(
  createCommentAction
);
const getCommentsController = new GetCommentsController(getCommentsAction);
const updateCommentController = new UpdateCommentController(
  updateCommentAction
);
const deleteCommentController = new DeleteCommentController(
  deleteCommentAction
);

const router: Router = express.Router();

router.post(
  "/",
  authMiddleware.verify(),
  commentsMiddleware.referenceOwnership(),
  createCommentController.handle()
);
router.get("/", getCommentsController.handle());
router.put(
  "/:commentId",
  authMiddleware.verify(),
  commentsMiddleware.ownership(),
  updateCommentController.handle()
);
router.delete(
  "/:commentId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  commentsMiddleware.ownership(),
  deleteCommentController.handle()
);

export default router;
