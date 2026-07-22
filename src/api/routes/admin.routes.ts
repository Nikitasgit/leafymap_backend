import express, { Router } from "express";
import type { RouteDependencies } from "@src/api/routes/routeDependencies";

const createAdminRoutes = ({
  adminMiddleware,
  authMiddleware,
  adminUsersController,
  adminResourcesController,
  announcementsController,
}: Pick<
  RouteDependencies,
  | "adminMiddleware"
  | "authMiddleware"
  | "adminUsersController"
  | "adminResourcesController"
  | "announcementsController"
>): Router => {
  const router: Router = express.Router();

  router.use(authMiddleware.verify(), adminMiddleware.requireAdmin());

  router.get("/users", adminUsersController.search());
  router.get("/users/:userId", adminUsersController.getById());
  router.get("/users/:userId/content", adminUsersController.getContent());
  router.patch("/users/:userId/ban", adminUsersController.ban());
  router.patch("/users/:userId/unban", adminUsersController.unban());
  router.patch("/users/:userId/delete", adminUsersController.delete());
  router.patch("/users/:userId/restore", adminUsersController.restore());

  router.get("/announcements", announcementsController.listAdmin());
  router.post("/announcements", announcementsController.create());
  router.get("/announcements/:id", announcementsController.getById());
  router.patch("/announcements/:id", announcementsController.update());
  router.post("/announcements/:id/publish", announcementsController.publish());
  router.post("/announcements/:id/archive", announcementsController.archive());
  router.post(
    "/announcements/:id/delete",
    announcementsController.softDelete()
  );

  router.patch(
    "/:resource/:resourceId/delete",
    adminResourcesController.delete()
  );
  router.patch(
    "/:resource/:resourceId/restore",
    adminResourcesController.restore()
  );

  return router;
};

export default createAdminRoutes;
