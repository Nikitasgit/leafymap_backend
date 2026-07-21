import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createFollowRoutes = ({
  followsController,
  authMiddleware,
}: Pick<RouteDependencies, "followsController" | "authMiddleware">): Router => {
  const router: Router = express.Router();

  router.post("/", authMiddleware.verify(), followsController.create());
  router.get("/check", authMiddleware.verify(), followsController.getOne());
  router.get("/followers/:userId", followsController.listFollowers());
  router.get("/following/:userId", followsController.listFollowing());
  router.delete("/:followId", authMiddleware.verify(), followsController.delete());

  return router;
};

export default createFollowRoutes;
