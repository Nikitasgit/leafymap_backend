import express, { Router } from "express";
import {
  uploadImages,
  deleteImages,
  getImages,
  authMiddleware,
  uploadMiddleware,
  rateLimiterMiddleware,
} from "@src/api/composition/images.composition";

const router: Router = express.Router();

router.post(
  "/",
  authMiddleware.verify(),
  uploadMiddleware.array("images", 10),
  uploadMiddleware.handleError(),
  uploadImages.handle()
);

router.delete(
  "/",
  authMiddleware.verify(),
  rateLimiterMiddleware.api(),
  deleteImages.handle()
);

router.get("/", getImages.handle());

export default router;
