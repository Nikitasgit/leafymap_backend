import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createCategoryRoutes = ({
  categoriesController,
}: Pick<RouteDependencies, "categoriesController">): Router => {
  const router: Router = express.Router();

  router.get("/", categoriesController.list());

  return router;
};

export default createCategoryRoutes;
