import express, { Router } from "express";
import {
  createMessage,
  updateMessage,
  deleteMessage,
  getMessages,
  getConversations,
  authMiddleware,
  messagesMiddleware,
  rateLimiterMiddleware,
} from "../di/message.di";

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), createMessage.handle());
router.get("/", getMessages.handle());
router.get(
  "/conversations",
  authMiddleware.verify(),
  getConversations.handle()
);
router.put(
  "/:messageId",
  authMiddleware.verify(),
  messagesMiddleware.ownership(),
  updateMessage.handle()
);
router.delete(
  "/:messageId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  messagesMiddleware.ownership(),
  deleteMessage.handle()
);

export default router;
