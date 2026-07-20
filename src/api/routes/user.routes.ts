import express, { Router } from "express";
import { cradle } from "@src/di/container";

const {
  usersController,
  authMiddleware,
  rateLimiterMiddleware,
} = cradle;

const router: Router = express.Router();

router.get("/", usersController.list());
router.get("/:userId/profile", usersController.getProfile());
router.get("/:userId", usersController.getById());
router.put("/", authMiddleware.verify(), usersController.update());
router.delete(
  "/",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  usersController.deleteAccount()
);

export default router;
