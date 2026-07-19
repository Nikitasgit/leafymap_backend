import express, { Router } from "express";
import {
  authMiddleware,
  createMessage,
  deleteMessage,
  getConversationWithUser,
  getConversations,
  getMessages,
  markMessagesAsRead,
  rateLimiterMiddleware,
  updateMessage,
} from "@src/api/composition/messages.composition";

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), createMessage.handle());
router.get(
  "/conversations",
  authMiddleware.verify(),
  getConversations.handle()
);
router.get(
  "/conversation/with/:otherUserId",
  authMiddleware.verify(),
  getConversationWithUser.handle()
);
router.get(
  "/conversation/:conversationId",
  authMiddleware.verify(),
  getMessages.handle()
);
router.put(
  "/conversation/:conversationId/read",
  authMiddleware.verify(),
  markMessagesAsRead.handle()
);
router.put(
  "/:messageId",
  authMiddleware.verify(),
  updateMessage.handle()
);
router.delete(
  "/:messageId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  deleteMessage.handle()
);

export default router;
