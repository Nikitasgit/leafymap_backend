import express, { Router } from "express";
import { cradle } from "@src/di/container";

const { placesController, authMiddleware, rateLimiterMiddleware } = cradle;

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), placesController.create());
router.put("/:placeId", authMiddleware.verify(), placesController.update());
router.delete(
  "/:placeId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  placesController.delete()
);
router.get("/search", placesController.list());
router.get("/in-view", placesController.getInView());
router.get("/:placeId", placesController.getById());

export default router;
