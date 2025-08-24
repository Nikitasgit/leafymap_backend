import express, { Router } from "express";
import auth from "../middlewares/auth";
import upload, { handleMulterError } from "../middlewares/uploadToS3";
import { uploadImages, deleteImages } from "../controllers/imageController";

const router: Router = express.Router();

// Route pour uploader une ou plusieurs images
router.post(
  "/images/upload",
  auth,
  upload.array("images", 10), // Limite à 10 images maximum
  handleMulterError,
  uploadImages
);
router.delete("/images/delete", auth, deleteImages);

export default router;
