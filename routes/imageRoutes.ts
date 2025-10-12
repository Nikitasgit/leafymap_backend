import express, { Router } from "express";
import auth from "../middlewares/auth";
import imagesOwnership from "../middlewares/imagesOwnership";
import {
  uploadImages,
  deleteImages,
  getGalleryImages,
} from "../controllers/imageController";
import imageUploadAuthorization from "../middlewares/imageUploadAuthorization";
import upload, { handleUploadError } from "../middlewares/memoryUpload";
import { strictLimiter } from "../middlewares/rateLimiter";

const router: Router = express.Router();

router.post(
  "/",
  auth,
  upload.array("images", 10),
  handleUploadError,
  imageUploadAuthorization,
  uploadImages
);

router.delete("/", auth, strictLimiter, imagesOwnership, deleteImages);

router.get("/gallery", getGalleryImages);

export default router;
