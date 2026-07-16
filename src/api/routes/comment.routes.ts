import express, { Router } from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  authMiddleware,
  rateLimiterMiddleware,
} from "@src/api/composition/comments.composition";

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), createComment.handle());
router.get("/", getComments.handle());
router.put("/:commentId", authMiddleware.verify(), updateComment.handle());
router.delete(
  "/:commentId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  deleteComment.handle()
);

export default router;
