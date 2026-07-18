import express, { Router } from "express";
import {
  createEventInvitations,
  updateEventInvitation,
  getEventInvitations,
  getEventInvitationsByUserId,
  authMiddleware,
} from "../di/eventInvitation.di";
import { eventsMiddleware } from "@src/api/composition/events.composition";

const router: Router = express.Router();

router.get(
  "/user/:userId",
  authMiddleware.verifyOptional(),
  getEventInvitationsByUserId.handle()
);
router.get(
  "/event/:eventId",
  authMiddleware.verifyOptional(),
  getEventInvitations.handle()
);
router.put("/", authMiddleware.verify(), updateEventInvitation.handle());
router.post(
  "/event/:eventId",
  authMiddleware.verify(),
  eventsMiddleware.ownership(),
  createEventInvitations.handle()
);

export default router;
