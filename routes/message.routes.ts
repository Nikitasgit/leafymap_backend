import express, { Router } from "express";
import {
  createMessage,
  updateMessage,
  deleteMessage,
  getMessages,
  getConversations,
  markMessagesAsRead,
  authMiddleware,
  messagesMiddleware,
  rateLimiterMiddleware,
  conversationMiddleware,
} from "../di/message.di";

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), createMessage.handle());
router.get(
  "/conversation/:conversationId",
  authMiddleware.verify(),
  conversationMiddleware.ownership(),
  getMessages.handle()
);
router.get(
  "/conversations",
  authMiddleware.verify(),
  getConversations.handle()
);
router.put(
  "/conversation/:conversationId/read",
  authMiddleware.verify(),
  conversationMiddleware.ownership(),
  markMessagesAsRead.handle()
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
