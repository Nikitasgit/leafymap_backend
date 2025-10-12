import express, { Router } from "express";
import auth from "../middlewares/auth";
import placeOwnership from "../middlewares/placeOwnership";
import {
  updatePlace,
  createPlace,
  getPlaceById,
  getPlacesInView,
  searchPlaces,
  deletePlace,
} from "../controllers/placeController";
import {
  getEventById,
  getEventsByPlaceId,
  updateEvent,
  createEvent,
  deleteEvent,
} from "../controllers/eventController";
import eventOwnership from "../middlewares/eventOwnership";
import { strictLimiter } from "../middlewares/rateLimiter";

const router: Router = express.Router();

router.post("/", auth, createPlace);
router.put("/:placeId", auth, placeOwnership, updatePlace);
router.delete("/:placeId", auth, strictLimiter, placeOwnership, deletePlace);
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
router.delete(
  "/:placeId/events/:eventId",
  auth,
  strictLimiter,
  placeOwnership,
  eventOwnership,
  deleteEvent
);

export default router;
