import express, { Router } from "express";
import {
  getUserById,
  getUsers,
  updateUser,
  deleteAccount,
  authMiddleware,
  rateLimiterMiddleware,
} from "../di/user.di";

const router: Router = express.Router();

router.get("/", getUsers.handle());
router.get("/:userId", getUserById.handle());
router.put("/", authMiddleware.verify(), updateUser.handle());
router.delete(
  "/",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  deleteAccount.handle()
);

export default router;
