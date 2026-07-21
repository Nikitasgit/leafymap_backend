import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createNotificationRoutes = ({
  authMiddleware,
  notificationsController,
}: Pick<RouteDependencies, "authMiddleware" | "notificationsController">): Router => {
  const router: Router = express.Router();

  router.get("/", authMiddleware.verify(), notificationsController.list());

  router.patch(
    "/read",
    authMiddleware.verify(),
    notificationsController.markAsRead()
  );

  router.patch(
    "/read-all",
    authMiddleware.verify(),
    notificationsController.markAllAsRead()
  );

  return router;
};

export default createNotificationRoutes;
