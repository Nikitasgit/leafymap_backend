import express, { Router } from "express";
import auth from "../middlewares/auth";
import commentOwnership from "../middlewares/commentOwnership";
import commentReferenceOwnership from "../middlewares/commentReferenceOwnership";
import { strictLimiter } from "../middlewares/rateLimiter";
import CreateCommentAction from "../actions/comments/CreateCommentAction";
import GetCommentsAction from "../actions/comments/GetCommentsAction";
import UpdateCommentAction from "../actions/comments/UpdateCommentAction";
import DeleteCommentAction from "../actions/comments/DeleteCommentAction";
import MongooseCommentRepository from "../repositories/comments/MongooseCommentRepository";
import CreateCommentController from "../controllers/comments/createCommentController";
import GetCommentsController from "../controllers/comments/getCommentsController";
import UpdateCommentController from "../controllers/comments/updateCommentController";
import DeleteCommentController from "../controllers/comments/deleteCommentController";
// Initialize repositories
const commentRepository = new MongooseCommentRepository();

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
  auth,
  commentReferenceOwnership,
  createCommentController.handle()
);
router.get("/", getCommentsController.handle());
router.put(
  "/:commentId",
  auth,
  commentOwnership,
  updateCommentController.handle()
);
router.delete(
  "/:commentId",
  auth,
  strictLimiter,
  commentOwnership,
  deleteCommentController.handle()
);

export default router;
