import express, { Router } from "express";
import auth from "../middlewares/auth";
import imagesOwnership from "../middlewares/imagesOwnership";
import { uploadImages, deleteImages } from "../controllers/imageController";
import imageUploadAuthorization from "../middlewares/imageUploadAuthorization";
import upload, { handleMulterError } from "../middlewares/uploadToS3";

const router: Router = express.Router();

router.post(
  "/",
  auth,
  upload.array("images", 10),
  handleMulterError,
  imageUploadAuthorization,
  uploadImages
);

router.delete("/", auth, imagesOwnership, deleteImages);

export default router;
