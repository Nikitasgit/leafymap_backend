import express, { Router } from "express";
import {
  getCurrentUserNotifications,
  authMiddleware,
} from "../di/notification.di";

const router: Router = express.Router();

router.get(
  "/",
  authMiddleware.verify(),
  getCurrentUserNotifications.handle()
);

export default router;
