import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createImageRoutes = ({
  imagesController,
  authMiddleware,
  uploadMiddleware,
  rateLimiterMiddleware,
}: Pick<RouteDependencies, "imagesController" | "authMiddleware" | "uploadMiddleware" | "rateLimiterMiddleware">): Router => {
  const router: Router = express.Router();

  router.post(
    "/",
    authMiddleware.verify(),
    uploadMiddleware.array("images", 10),
    uploadMiddleware.handleError(),
    imagesController.upload()
  );

  router.delete(
    "/",
    authMiddleware.verify(),
    rateLimiterMiddleware.api(),
    imagesController.delete()
  );

  router.get("/", imagesController.list());

  return router;
};

export default createImageRoutes;
