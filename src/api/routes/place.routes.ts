import express, { Router } from "express";
import {
  createPlace,
  updatePlace,
  deletePlace,
  getPlaceById,
  getPlaces,
  getPlacesInView,
  authMiddleware,
  rateLimiterMiddleware,
} from "@src/api/composition/places.composition";

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), createPlace.handle());
router.put("/:placeId", authMiddleware.verify(), updatePlace.handle());
router.delete(
  "/:placeId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  deletePlace.handle()
);
router.get("/search", getPlaces.handle());
router.get("/in-view", getPlacesInView.handle());
router.get("/:placeId", getPlaceById.handle());

export default router;
