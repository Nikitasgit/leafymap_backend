import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createPlaceRoutes = ({
  placesController,
  authMiddleware,
  rateLimiterMiddleware,
}: Pick<RouteDependencies, "placesController" | "authMiddleware" | "rateLimiterMiddleware">): Router => {
  const router: Router = express.Router();

  router.post("/", authMiddleware.verify(), placesController.create());
  router.put("/:placeId", authMiddleware.verify(), placesController.update());
  router.delete(
    "/:placeId",
    authMiddleware.verify(),
    rateLimiterMiddleware.strict(),
    placesController.delete()
  );
  router.get("/search", placesController.list());
  router.get("/in-view", placesController.getInView());
  router.get("/:placeId", placesController.getById());

  return router;
};

export default createPlaceRoutes;
