import express, { Router } from "express";
import {
  createReview,
  getReviews,
  getMyReviews,
  getReceivedReviews,
  updateReview,
  deleteReview,
  authMiddleware,
  reviewsMiddleware,
  rateLimiterMiddleware,
} from "../di/review.di";

const router: Router = express.Router();

router.post(
  "/",
  authMiddleware.verify(),
  reviewsMiddleware.referenceOwnership(),
  createReview.handle()
);
router.get("/", getReviews.handle());
router.get("/my-reviews", authMiddleware.verify(), getMyReviews.handle());
router.get("/received", authMiddleware.verify(), getReceivedReviews.handle());
router.put(
  "/:reviewId",
  authMiddleware.verify(),
  reviewsMiddleware.ownership(),
  updateReview.handle()
);
router.delete(
  "/:reviewId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  reviewsMiddleware.ownership(),
  deleteReview.handle()
);

export default router;
