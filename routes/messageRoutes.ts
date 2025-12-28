import express, { Router } from "express";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import MessagesMiddleware from "../middlewares/MessagesMiddleware";
import RateLimiterMiddleware from "../middlewares/RateLimiterMiddleware";
import CreateMessageAction from "../actions/messages/CreateMessageAction";
import UpdateMessageAction from "../actions/messages/UpdateMessageAction";
import DeleteMessageAction from "../actions/messages/DeleteMessageAction";
import GetMessagesAction from "../actions/messages/GetMessagesAction";
import MongooseMessageRepository from "../repositories/messages/MongooseMessageRepository";
import MongooseUserRepository from "../repositories/users/MongooseUserRepository";
import CreateMessageController from "../controllers/messages/createMessageController";
import UpdateMessageController from "../controllers/messages/updateMessageController";
import DeleteMessageController from "../controllers/messages/deleteMessageController";
import GetMessagesController from "../controllers/messages/getMessagesController";

// Initialize repositories
const messageRepository = new MongooseMessageRepository();
const userRepository = new MongooseUserRepository();

const authMiddleware = new AuthMiddleware(userRepository);
const messagesMiddleware = new MessagesMiddleware(messageRepository);
const rateLimiterMiddleware = new RateLimiterMiddleware();

// Initialize actions
const createMessageAction = new CreateMessageAction(messageRepository);
const updateMessageAction = new UpdateMessageAction(messageRepository);
const deleteMessageAction = new DeleteMessageAction(messageRepository);
const getMessagesAction = new GetMessagesAction(messageRepository);

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
const getMessagesController = new GetMessagesController(getMessagesAction);

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), createMessageController.handle());
router.get("/", getMessagesController.handle());
router.put(
  "/:messageId",
  authMiddleware.verify(),
  messagesMiddleware.ownership(),
  updateMessageController.handle()
);
router.delete(
  "/:messageId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  messagesMiddleware.ownership(),
  deleteMessageController.handle()
);

export default router;
