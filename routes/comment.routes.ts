import express, { Router } from "express";
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  authMiddleware,
  commentsMiddleware,
  rateLimiterMiddleware,
} from "../di/comment.di";

const router: Router = express.Router();

router.post(
  "/",
  authMiddleware.verify(),
  commentsMiddleware.referenceOwnership(),
  createComment.handle()
);
router.get("/", getComments.handle());
router.put(
  "/:commentId",
  authMiddleware.verify(),
  commentsMiddleware.ownership(),
  updateComment.handle()
);
router.delete(
  "/:commentId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  commentsMiddleware.ownership(),
  deleteComment.handle()
);

export default router;
