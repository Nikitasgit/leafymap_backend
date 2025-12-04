import express, { Router } from "express";
import auth from "../middlewares/auth";
import commentOwnership from "../middlewares/commentOwnership";
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
const commentRepository = MongooseCommentRepository();

// Initialize actions
const createCommentAction = CreateCommentAction(commentRepository);
const viewCommentsListAction = ViewCommentsListAction(commentRepository);
const updateCommentAction = UpdateCommentAction(commentRepository);
const deleteCommentAction = DeleteCommentAction(commentRepository);

// Initialize controllers
const createCommentController = CreateCommentController(createCommentAction);
const viewCommentsListController = ViewCommentsListController(
  viewCommentsListAction
);
const updateCommentController = UpdateCommentController(updateCommentAction);
const deleteCommentController = DeleteCommentController(deleteCommentAction);

const router: Router = express.Router();

router.post("/", auth, createCommentController);
router.get("/", viewCommentsListController);
router.put("/:commentId", auth, commentOwnership, updateCommentController);
router.delete(
  "/:commentId",
  auth,
  strictLimiter,
  commentOwnership,
  deleteCommentController
);

export default router;
