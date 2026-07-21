import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createEventBookingRoutes = ({
  eventBookingsController,
  authMiddleware,
}: Pick<RouteDependencies, "eventBookingsController" | "authMiddleware">): Router => {
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

  return router;
};

export default createEventBookingRoutes;
