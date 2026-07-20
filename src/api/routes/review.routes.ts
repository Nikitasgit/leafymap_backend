import express, { Router } from "express";
import { cradle } from "@src/di/container";

const {
  reviewsController,
  authMiddleware,
  rateLimiterMiddleware,
} = cradle;

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), reviewsController.create());
router.get("/", reviewsController.list());
router.get("/my-reviews", authMiddleware.verify(), reviewsController.listMine());
router.get("/received", authMiddleware.verify(), reviewsController.listReceived());
router.put("/:reviewId", authMiddleware.verify(), reviewsController.update());
router.delete(
  "/:reviewId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  reviewsController.delete()
);

export default router;
