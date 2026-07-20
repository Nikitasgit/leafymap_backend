import express, { Router } from "express";
import { cradle } from "@src/di/container";

const { partnershipsController, authMiddleware } = cradle;

const router: Router = express.Router();

router.get(
  "/user/:userId",
  authMiddleware.verifyOptional(),
  partnershipsController.listByUser()
);
router.put("/update", authMiddleware.verify(), partnershipsController.update());
router.post("/", authMiddleware.verify(), partnershipsController.create());
router.delete(
  "/:partnershipId",
  authMiddleware.verify(),
  partnershipsController.delete()
);

export default router;
