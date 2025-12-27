import express, { Router } from "express";
import auth from "../middlewares/auth";
import messageOwnership from "../middlewares/messageOwnership";
import { strictLimiter } from "../middlewares/rateLimiter";
import CreateMessageAction from "../actions/messages/CreateMessageAction";
import UpdateMessageAction from "../actions/messages/UpdateMessageAction";
import DeleteMessageAction from "../actions/messages/DeleteMessageAction";
import ViewMessagesListAction from "../actions/messages/ViewMessagesListAction";
import MongooseMessageRepository from "../repositories/messages/MongooseMessageRepository";
import CreateMessageController from "../controllers/messages/createMessageController";
import UpdateMessageController from "../controllers/messages/updateMessageController";
import DeleteMessageController from "../controllers/messages/deleteMessageController";
import ViewMessagesListController from "../controllers/messages/viewMessagesListController";

// Initialize repositories
const messageRepository = new MongooseMessageRepository();

// Initialize actions
const createMessageAction = new CreateMessageAction(messageRepository);
const updateMessageAction = new UpdateMessageAction(messageRepository);
const deleteMessageAction = new DeleteMessageAction(messageRepository);
const viewMessagesListAction = new ViewMessagesListAction(messageRepository);

// Initialize controllers
const createMessageController = new CreateMessageController(
  createMessageAction
);
const updateMessageController = new UpdateMessageController(
  updateMessageAction
);
const deleteMessageController = new DeleteMessageController(
  deleteMessageAction
);
const viewMessagesListController = new ViewMessagesListController(
  viewMessagesListAction
);

const router: Router = express.Router();

router.post("/", auth, createMessageController.handle());
router.get("/", viewMessagesListController.handle());
router.put(
  "/:messageId",
  auth,
  messageOwnership,
  updateMessageController.handle()
);
router.delete(
  "/:messageId",
  auth,
  strictLimiter,
  messageOwnership,
  deleteMessageController.handle()
);

export default router;
