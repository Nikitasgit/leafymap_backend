import express, { Router } from "express";
import {
  authMiddleware,
  getCurrentUserNotifications,
  markAllNotificationsAsRead,
  markNotificationsAsRead,
} from "@src/api/composition/notifications.composition";

const router: Router = express.Router();

router.get("/", authMiddleware.verify(), getCurrentUserNotifications.handle());

router.patch("/read", authMiddleware.verify(), markNotificationsAsRead.handle());

router.patch(
  "/read-all",
  authMiddleware.verify(),
  markAllNotificationsAsRead.handle()
);

export default router;
