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

router.post("/create-creator", auth, addCreator);
router.post("/create-organizer", auth, addOrganizer);
router.put("/update-creator", auth, updateCreator);
router.get("/profile", auth, getUser);
router.get("/find-creators", findCreators as any);
router.get("/creator-in-places-and-events", getUserInPlacesAndEvents as any);

export default router;
