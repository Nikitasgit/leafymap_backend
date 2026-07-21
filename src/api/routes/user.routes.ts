import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createUserRoutes = ({
  usersController,
  authMiddleware,
  rateLimiterMiddleware,
}: Pick<RouteDependencies, "usersController" | "authMiddleware" | "rateLimiterMiddleware">): Router => {
  const router: Router = express.Router();

  router.get("/", usersController.list());
  router.get("/:userId/profile", usersController.getProfile());
  router.get("/:userId", usersController.getById());
  router.put("/", authMiddleware.verify(), usersController.update());
  router.delete(
    "/",
    authMiddleware.verify(),
    rateLimiterMiddleware.strict(),
    usersController.deleteAccount()
  );

  return router;
};

export default createUserRoutes;
