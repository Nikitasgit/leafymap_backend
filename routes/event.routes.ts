import express, { Router } from "express";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEventById,
  getEvents,
  authMiddleware,
  eventsMiddleware,
  placesMiddleware,
  rateLimiterMiddleware,
} from "../di/event.di";

const router: Router = express.Router();

router.get("/", getEvents.handle());
router.post("/", authMiddleware.verify(), createEvent.handle());
router.post(
  "/place/:placeId",
  authMiddleware.verify(),
  placesMiddleware.ownership(),
  createEvent.handle()
);
router.get("/:eventId", getEventById.handle());
router.put(
  "/:eventId",
  authMiddleware.verify(),
  eventsMiddleware.ownership(),
  updateEvent.handle()
);
router.delete(
  "/:eventId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  eventsMiddleware.ownership(),
  deleteEvent.handle()
);

export default router;
