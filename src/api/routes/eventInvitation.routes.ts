import express, { Router } from "express";
import {
  createEventInvitations,
  updateEventInvitation,
  getEventInvitations,
  getEventInvitationsByUserId,
  authMiddleware,
} from "@src/api/composition/eventInvitations.composition";

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
  createEventInvitations.handle()
);

export default router;
