import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createReviewRoutes = ({
  reviewsController,
  authMiddleware,
  rateLimiterMiddleware,
}: Pick<RouteDependencies, "reviewsController" | "authMiddleware" | "rateLimiterMiddleware">): Router => {
  const router: Router = express.Router();

  router.post("/", authMiddleware.verify(), reviewsController.create());
  router.get("/", reviewsController.list());
  router.get("/my-reviews", authMiddleware.verify(), reviewsController.listMine());
  router.get("/received", authMiddleware.verify(), reviewsController.listReceived());
  router.put("/:reviewId", authMiddleware.verify(), reviewsController.update());
  router.delete(
    "/:reviewId",
    authMiddleware.verify(),
    rateLimiterMiddleware.strict(),
    reviewsController.delete()
  );

  return router;
};

export default createReviewRoutes;
