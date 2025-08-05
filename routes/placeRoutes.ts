import express, { Router } from "express";
import auth from "../middlewares/auth";
import {
  updatePlace,
  createPlace,
  getPlaceById,
  getPlacesInView,
  searchPlaces,
} from "../controllers/placeController";
import upload, { handleMulterError } from "../middlewares/uploadToS3";
import {
  createEvent,
  getEventsByPlaceId,
  updateEvent,
} from "../controllers/eventController";

const router: Router = express.Router();

router.post("/", auth, createPlace);

router.post("/:placeId/events", auth, createEvent);

router.get("/search", searchPlaces);
router.get("/in-view", getPlacesInView);
router.get("/:id", getPlaceById);
router.get("/:id/events", getEventsByPlaceId);

router.put("/:id", auth, updatePlace);
router.put("/:placeId/events/:eventId", auth, updateEvent);

export default router;
