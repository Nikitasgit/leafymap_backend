import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createCommentRoutes = ({
  commentsController,
  authMiddleware,
  rateLimiterMiddleware,
}: Pick<RouteDependencies, "commentsController" | "authMiddleware" | "rateLimiterMiddleware">): Router => {
  const router: Router = express.Router();

  router.post("/", authMiddleware.verify(), commentsController.create());
  router.get("/", commentsController.list());
  router.put("/:commentId", authMiddleware.verify(), commentsController.update());
  router.delete(
    "/:commentId",
    authMiddleware.verify(),
    rateLimiterMiddleware.strict(),
    commentsController.delete()
  );

  return router;
};

export default createCommentRoutes;
