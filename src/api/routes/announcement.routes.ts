import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createAnnouncementRoutes = ({
  announcementsController,
}: Pick<RouteDependencies, "announcementsController">): Router => {
  const router: Router = express.Router();

  router.get("/", announcementsController.listActive());

  return router;
};

export default createAnnouncementRoutes;
