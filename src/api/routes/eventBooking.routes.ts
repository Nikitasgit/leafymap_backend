import express, { Router } from "express";
import { cradle } from "@src/di/container";

const { eventBookingsController, authMiddleware } = cradle;

const router: Router = express.Router();

router.get("/me", authMiddleware.verify(), eventBookingsController.listMine());
router.get(
  "/event/:eventId/me",
  authMiddleware.verify(),
  eventBookingsController.getMyForEvent()
);
router.get(
  "/event/:eventId",
  authMiddleware.verify(),
  eventBookingsController.listByEvent()
);
router.post(
  "/event/:eventId",
  authMiddleware.verify(),
  eventBookingsController.create()
);
router.put(
  "/:bookingId",
  authMiddleware.verify(),
  eventBookingsController.update()
);
router.delete(
  "/:bookingId",
  authMiddleware.verify(),
  eventBookingsController.cancel()
);

export default router;
