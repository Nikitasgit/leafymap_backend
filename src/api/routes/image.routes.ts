import express, { Router } from "express";
import { cradle } from "@src/di/container";

const {
  imagesController,
  authMiddleware,
  uploadMiddleware,
  rateLimiterMiddleware,
} = cradle;

const router: Router = express.Router();

router.post(
  "/",
  authMiddleware.verify(),
  uploadMiddleware.array("images", 10),
  uploadMiddleware.handleError(),
  imagesController.upload()
);

router.delete(
  "/",
  authMiddleware.verify(),
  rateLimiterMiddleware.api(),
  imagesController.delete()
);

router.get("/", imagesController.list());

export default router;
