import express, { Router } from "express";
import auth from "../middlewares/auth";
import upload, { handleMulterError } from "../middlewares/uploadToS3";
import {
  getUser,
  updateCreator,
  addCreator,
  addOrganizer,
  findCreators,
  getUserInPlacesAndEvents,
} from "../controllers/userController";

const router: Router = express.Router();

router.post(
  "/create-creator",
  auth as any,
  upload.single("image"),
  handleMulterError,
  addCreator as any
);
router.post(
  "/create-organizer",
  auth as any,
  upload.single("image"),
  handleMulterError,
  addOrganizer as any
);
router.put(
  "/update-creator",
  auth as any,
  upload.single("image"),
  handleMulterError,
  updateCreator as any
);
router.get("/profile", auth as any, getUser as any);
router.get("/find-creators", findCreators as any);
router.get("/creator-in-places-and-events", getUserInPlacesAndEvents as any);

export default router;
