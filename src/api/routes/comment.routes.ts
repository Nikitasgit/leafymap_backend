import express, { Router } from "express";
import { cradle } from "@src/di/container";

const { commentsController, authMiddleware, rateLimiterMiddleware } = cradle;

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), commentsController.create());
router.get("/", commentsController.list());
router.put("/:commentId", authMiddleware.verify(), commentsController.update());
router.delete(
  "/:commentId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  commentsController.delete()
);

export default router;
