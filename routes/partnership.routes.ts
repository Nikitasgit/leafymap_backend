import express, { Router } from "express";
import {
  createPartnership,
  updatePartnership,
  getPartnerships,
  getPartnershipsByUserId,
  getUserPlacesPartnerships,
  getUserEventsPartnerships,
  authMiddleware,
  placesMiddleware,
} from "../di/partnership.di";

const router: Router = express.Router();

router.get(
  "/user/:userId",
  authMiddleware.verifyOptional(),
  getPartnershipsByUserId.handle()
);
router.get(
  "/user/:userId/places",
  authMiddleware.verifyOptional(),
  getUserPlacesPartnerships.handle()
);
router.get(
  "/user/:userId/events",
  authMiddleware.verifyOptional(),
  getUserEventsPartnerships.handle()
);
router.get(
  "/:placeId/:eventId?",
  authMiddleware.verifyOptional(),
  getPartnerships.handle()
);
router.put(
  "/:placeId/:eventId?",
  authMiddleware.verify(),
  updatePartnership.handle()
);
router.post(
  "/:placeId/:eventId?",
  authMiddleware.verify(),
  placesMiddleware.ownership(),
  createPartnership.handle()
);

export default router;
