import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createProductRoutes = ({
  productsController,
  authMiddleware,
}: Pick<RouteDependencies, "productsController" | "authMiddleware">): Router => {
  const router: Router = express.Router();

  router.post("/", authMiddleware.verify(), productsController.create());
  router.get("/", productsController.list());
  router.get("/:productId", productsController.getById());
  router.put(
    "/:productId",
    authMiddleware.verify(),
    productsController.update()
  );
  router.delete(
    "/:productId",
    authMiddleware.verify(),
    productsController.delete()
  );

  return router;
};

export default createProductRoutes;
