import express, { Router } from "express";
import auth from "../middlewares/auth";
import upload, { handleMulterError } from "../middlewares/uploadToS3";
import { uploadImages, deleteImages } from "../controllers/awsController";

const router: Router = express.Router();

router.post(
  "/images/upload",
  auth,
  upload.array("images", 10), // Limite à 10 images maximum
  handleMulterError,
  uploadImages
);
router.delete("/images/delete", auth, deleteImages);

export default router;
