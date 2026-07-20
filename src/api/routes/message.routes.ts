import express, { Router } from "express";
import { cradle } from "@src/di/container";

const {
  authMiddleware,
  messagesController,
  rateLimiterMiddleware,
} = cradle;

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), messagesController.create());
router.get(
  "/conversations",
  authMiddleware.verify(),
  messagesController.listConversations()
);
router.get(
  "/conversation/with/:otherUserId",
  authMiddleware.verify(),
  messagesController.getConversationWithUser()
);
router.get(
  "/conversation/:conversationId",
  authMiddleware.verify(),
  messagesController.list()
);
router.put(
  "/conversation/:conversationId/read",
  authMiddleware.verify(),
  messagesController.markAsRead()
);
router.put(
  "/:messageId",
  authMiddleware.verify(),
  messagesController.update()
);
router.delete(
  "/:messageId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  messagesController.delete()
);

export default router;
