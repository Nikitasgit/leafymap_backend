import express, { Router } from "express";
import {
  uploadImages,
  deleteImages,
  getImages,
  authMiddleware,
  imagesMiddleware,
  uploadMiddleware,
  rateLimiterMiddleware,
} from "../di/image.di";

const router: Router = express.Router();

router.post(
  "/",
  authMiddleware.verify(),
  uploadMiddleware.array("images", 10),
  uploadMiddleware.handleError(),
  imagesMiddleware.referenceOwnership(),
  uploadImages.handle()
);

router.delete(
  "/",
  authMiddleware.verify(),
  rateLimiterMiddleware.api(),
  imagesMiddleware.ownership(),
  deleteImages.handle()
);

router.get("/", getImages.handle());

export default router;
