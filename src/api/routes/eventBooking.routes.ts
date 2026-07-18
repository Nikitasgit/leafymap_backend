import express, { Router } from "express";
import {
  createEventBooking,
  updateEventBooking,
  cancelEventBooking,
  getEventBookingsByEvent,
  getMyEventBookings,
  getMyEventBookingForEvent,
  authMiddleware,
} from "@src/api/composition/eventBookings.composition";

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
  updateEventBooking.handle()
);
router.delete(
  "/:bookingId",
  authMiddleware.verify(),
  cancelEventBooking.handle()
);

export default router;
