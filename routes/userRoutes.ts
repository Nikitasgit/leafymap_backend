import express, { Router } from "express";
import auth from "../middlewares/auth";
import {
  getUserById,
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
router.get("/find-creators", auth, findCreators);
router.get("/creator-in-places-and-events", getUserInPlacesAndEvents);
router.get("/:userId", getUserById);

export default router;
