import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createMessageRoutes = ({
  authMiddleware,
  messagesController,
  rateLimiterMiddleware,
}: Pick<RouteDependencies, "authMiddleware" | "messagesController" | "rateLimiterMiddleware">): Router => {
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

  return router;
};

export default createMessageRoutes;
