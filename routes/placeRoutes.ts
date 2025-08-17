import express, { Router } from "express";
import auth from "../middlewares/auth";
import placeOwnership from "../middlewares/placeOwnership";
import {
  updatePlace,
  createPlace,
  getPlaceById,
  getPlacesInView,
  searchPlaces,
} from "../controllers/placeController";
import {
  createEvent,
  getEventsByPlaceId,
  updateEvent,
} from "../controllers/eventController";

const router: Router = express.Router();

// Place routes
router.post("/", auth, createPlace);
router.put("/:placeId", auth, placeOwnership, updatePlace);
router.get("/search", searchPlaces);
router.get("/in-view", getPlacesInView);
router.get("/:placeId", getPlaceById);

// Event routes
router.post("/:placeId/events", auth, placeOwnership, createEvent);
router.put("/:placeId/events/:eventId", auth, placeOwnership, updateEvent);
router.get("/:placeId/events", getEventsByPlaceId);

export default router;
