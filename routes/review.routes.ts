import express, { Router } from "express";
import {
  createReview,
  getReviews,
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
