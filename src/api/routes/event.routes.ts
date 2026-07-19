import express, { Router } from "express";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getEventById,
  getEvents,
  getEventsInView,
  authMiddleware,
  rateLimiterMiddleware,
} from "@src/api/composition/events.composition";

const router: Router = express.Router();

router.get("/", getEvents.handle());
router.get("/in-view", getEventsInView.handle());
router.post("/", authMiddleware.verify(), createEvent.handle());
router.get("/:eventId", getEventById.handle());
router.put("/:eventId", authMiddleware.verify(), updateEvent.handle());
router.delete(
  "/:eventId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  deleteEvent.handle()
);

export default router;
