import express, { Router } from "express";
import auth from "../middlewares/auth";
import commentOwnership from "../middlewares/commentOwnership";
import commentReferenceOwnership from "../middlewares/commentReferenceOwnership";
import { strictLimiter } from "../middlewares/rateLimiter";
import CreateCommentAction from "../actions/comments/CreateCommentAction";
import ViewCommentsListAction from "../actions/comments/ViewCommentsListAction";
import UpdateCommentAction from "../actions/comments/UpdateCommentAction";
import DeleteCommentAction from "../actions/comments/DeleteCommentAction";
import MongooseCommentRepository from "../repositories/comments/MongooseCommentRepository";
import CreateCommentController from "../controllers/comments/createCommentController";
import ViewCommentsListController from "../controllers/comments/viewCommentsListController";
import UpdateCommentController from "../controllers/comments/updateCommentController";
import DeleteCommentController from "../controllers/comments/deleteCommentController";
// Initialize repositories
const commentRepository = new MongooseCommentRepository();

// Initialize actions
const createCommentAction = new CreateCommentAction(commentRepository);
const viewCommentsListAction = new ViewCommentsListAction(commentRepository);
const updateCommentAction = new UpdateCommentAction(commentRepository);
const deleteCommentAction = new DeleteCommentAction(commentRepository);

// Initialize controllers
const createCommentController = new CreateCommentController(
  createCommentAction
);
const viewCommentsListController = new ViewCommentsListController(
  viewCommentsListAction
);
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
router.get("/", viewCommentsListController.handle());
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
