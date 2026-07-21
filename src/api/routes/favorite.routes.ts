import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createFavoriteRoutes = ({
  favoritesController,
  authMiddleware,
}: Pick<RouteDependencies, "favoritesController" | "authMiddleware">): Router => {
  const router: Router = express.Router();

  router.get("/", authMiddleware.verify(), favoritesController.listByType());
  router.post("/", authMiddleware.verify(), favoritesController.create());
  router.delete("/", authMiddleware.verify(), favoritesController.delete());

  return router;
};

export default createFavoriteRoutes;
