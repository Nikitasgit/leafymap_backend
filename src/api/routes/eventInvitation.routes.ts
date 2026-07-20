import express, { Router } from "express";
import { cradle } from "@src/di/container";

const { eventInvitationsController, authMiddleware } = cradle;

const router: Router = express.Router();

router.get(
  "/user/:userId",
  authMiddleware.verifyOptional(),
  eventInvitationsController.listByUser()
);
router.get(
  "/event/:eventId",
  authMiddleware.verifyOptional(),
  eventInvitationsController.list()
);
router.put("/", authMiddleware.verify(), eventInvitationsController.update());
router.post(
  "/event/:eventId",
  authMiddleware.verify(),
  eventInvitationsController.create()
);

export default router;
