import express, { Router } from "express";
import auth from "../middlewares/auth";
import upload, { handleMulterError } from "../middlewares/uploadToS3";
import { uploadProfilePicture } from "../controllers/imageController";

const router: Router = express.Router();

router.post(
  "/profile-picture",
  auth,
  upload.single("image"),
  handleMulterError,
  uploadProfilePicture
);

export default router;
