import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createEventInvitationRoutes = ({
  eventInvitationsController,
  authMiddleware,
}: Pick<RouteDependencies, "eventInvitationsController" | "authMiddleware">): Router => {
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

  return router;
};

export default createEventInvitationRoutes;
