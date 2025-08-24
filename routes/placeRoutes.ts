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
  getEventById,
  getEventsByPlaceId,
  updateEvent,
  createEvent,
} from "../controllers/eventController";
import eventOwnership from "../middlewares/eventOwnership";

const router: Router = express.Router();

router.post("/", auth, createPlace);
router.put("/:placeId", auth, placeOwnership, updatePlace);
router.get("/search", searchPlaces);
router.get("/in-view", getPlacesInView);
router.get("/:placeId", getPlaceById);

// Event routes nested under places
router.get("/:placeId/events", getEventsByPlaceId);
router.post("/:placeId/events", auth, placeOwnership, createEvent);
router.get("/:placeId/events/:eventId", getEventById);
router.put(
  "/:placeId/events/:eventId",
  auth,
  placeOwnership,
  eventOwnership,
  updateEvent
);

export default router;
