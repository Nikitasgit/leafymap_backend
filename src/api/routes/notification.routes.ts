import express, { Router } from "express";
import { cradle } from "@src/di/container";

const { authMiddleware, notificationsController } = cradle;

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

export default router;
