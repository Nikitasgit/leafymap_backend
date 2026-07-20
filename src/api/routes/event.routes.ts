import express, { Router } from "express";
import { cradle } from "@src/di/container";

const { eventsController, authMiddleware, rateLimiterMiddleware } = cradle;

const router: Router = express.Router();

router.get("/", eventsController.list());
router.get("/in-view", eventsController.getInView());
router.post("/", authMiddleware.verify(), eventsController.create());
router.get("/:eventId", eventsController.getById());
router.put("/:eventId", authMiddleware.verify(), eventsController.update());
router.delete(
  "/:eventId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  eventsController.delete()
);

export default router;
