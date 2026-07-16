import express, { Router } from "express";
import {
  createReview,
  getReviews,
  getMyReviews,
  getReceivedReviews,
  updateReview,
  deleteReview,
  authMiddleware,
  rateLimiterMiddleware,
} from "@src/api/composition/reviews.composition";

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), createReview.handle());
router.get("/", getReviews.handle());
router.get("/my-reviews", authMiddleware.verify(), getMyReviews.handle());
router.get("/received", authMiddleware.verify(), getReceivedReviews.handle());
router.put("/:reviewId", authMiddleware.verify(), updateReview.handle());
router.delete(
  "/:reviewId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  deleteReview.handle()
);

export default router;
