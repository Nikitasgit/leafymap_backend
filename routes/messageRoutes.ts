import express, { Router } from "express";
import auth from "../middlewares/auth";
import messageOwnership from "../middlewares/messageOwnership";
import { strictLimiter } from "../middlewares/rateLimiter";
import CreateReviewMessageAction from "../actions/messages/CreateReviewMessageAction";
import UpdateMessageAction from "../actions/messages/UpdateMessageAction";
import DeleteMessageAction from "../actions/messages/DeleteMessageAction";
import ViewMessagesListAction from "../actions/messages/ViewMessagesListAction";
import MongooseMessageRepository from "../repositories/messages/MongooseMessageRepository";
import CreateMessageController from "../controllers/messages/createMessageController";
import UpdateMessageController from "../controllers/messages/updateMessageController";
import DeleteMessageController from "../controllers/messages/deleteMessageController";
import ViewMessagesListController from "../controllers/messages/viewMessagesListController";

// Initialize repositories
const messageRepository = MongooseMessageRepository();

// Initialize actions
const createReviewMessageAction = CreateReviewMessageAction(messageRepository);
const updateMessageAction = UpdateMessageAction(messageRepository);
const deleteMessageAction = DeleteMessageAction(messageRepository);
const viewMessagesListAction = ViewMessagesListAction(messageRepository);

// Initialize controllers
const createMessageReviewController = CreateMessageController(
  createReviewMessageAction
);
const updateMessageController = UpdateMessageController(updateMessageAction);
const deleteMessageController = DeleteMessageController(deleteMessageAction);
const viewMessagesListController = ViewMessagesListController(
  viewMessagesListAction
);

const router: Router = express.Router();

// Owner can reply to a review
router.post("/review", auth, createMessageReviewController);
router.get("/", viewMessagesListController);
router.put("/:messageId", auth, messageOwnership, updateMessageController);
router.delete(
  "/:messageId",
  auth,
  strictLimiter,
  messageOwnership,
  deleteMessageController
);

export default router;
