import express, { Router } from "express";
import {
  getEventById,
  getEventsByPlaceId,
  updateEvent,
} from "../controllers/eventController";
import auth from "../middlewares/auth";
import placeOwnership from "../middlewares/placeOwnership";
import eventOwnership from "../middlewares/eventOwnership";
import { createEvent } from "../controllers/eventController";

const router: Router = express.Router();

router.get("/:eventId", getEventById);
router.post("/:placeId/events", auth, placeOwnership, createEvent);
router.put(
  "/:placeId/events/:eventId",
  auth,
  placeOwnership,
  eventOwnership,
  updateEvent
);
router.get("/:placeId/events", getEventsByPlaceId);
export default router;
