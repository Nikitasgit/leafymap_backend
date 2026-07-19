import express, { Router } from "express";
import {
  adminMiddleware,
  authMiddleware,
  banAdminUser,
  getAdminUser,
  getAdminUserContent,
  searchAdminUsers,
  softDeleteAdminResource,
  softDeleteAdminUser,
} from "@src/api/composition/admin.composition";

const router: Router = express.Router();

router.use(authMiddleware.verify(), adminMiddleware.requireAdmin());

router.get("/users", searchAdminUsers.handle());
router.get("/users/:userId", getAdminUser.handle());
router.get("/users/:userId/content", getAdminUserContent.handle());
router.patch("/users/:userId/ban", banAdminUser.ban());
router.patch("/users/:userId/unban", banAdminUser.unban());
router.patch("/users/:userId/delete", softDeleteAdminUser.delete());
router.patch("/users/:userId/restore", softDeleteAdminUser.restore());

router.patch("/:resource/:resourceId/delete", softDeleteAdminResource.delete());
router.patch(
  "/:resource/:resourceId/restore",
  softDeleteAdminResource.restore()
);

export default router;
