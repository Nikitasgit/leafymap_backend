import express, { Router } from "express";
import {
  createEventBooking,
  updateEventBooking,
  cancelEventBooking,
  getEventBookingsByEvent,
  getMyEventBookings,
  getMyEventBookingForEvent,
  authMiddleware,
  eventBookingMiddleware,
} from "../di/eventBooking.di";

const router: Router = express.Router();

router.get("/me", authMiddleware.verify(), getMyEventBookings.handle());
router.get(
  "/event/:eventId/me",
  authMiddleware.verify(),
  getMyEventBookingForEvent.handle()
);
router.get(
  "/event/:eventId",
  authMiddleware.verify(),
  eventBookingMiddleware.eventOwnership(),
  getEventBookingsByEvent.handle()
);
router.post(
  "/event/:eventId",
  authMiddleware.verify(),
  createEventBooking.handle()
);
router.put(
  "/:bookingId",
  authMiddleware.verify(),
  eventBookingMiddleware.ownership(),
  updateEventBooking.handle()
);
router.delete(
  "/:bookingId",
  authMiddleware.verify(),
  eventBookingMiddleware.ownership(),
  cancelEventBooking.handle()
);

export default router;
