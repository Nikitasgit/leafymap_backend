import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createEventRoutes = ({
  eventsController,
  authMiddleware,
  rateLimiterMiddleware,
}: Pick<RouteDependencies, "eventsController" | "authMiddleware" | "rateLimiterMiddleware">): Router => {
  const router: Router = express.Router();

  router.get("/", eventsController.list());
  router.get("/in-view", eventsController.getInView());
  router.post("/", authMiddleware.verify(), eventsController.create());
  router.get("/:eventId", eventsController.getById());
  router.put("/:eventId", authMiddleware.verify(), eventsController.update());
  router.delete(
    "/:eventId",
    authMiddleware.verify(),
    rateLimiterMiddleware.strict(),
    eventsController.delete()
  );

  return router;
};

export default createEventRoutes;
