import express, { Router } from "express";
import {
  createPlace,
  updatePlace,
  deletePlace,
  getPlaceById,
  getPlaces,
  getPlacesInView,
  authMiddleware,
  placesMiddleware,
  rateLimiterMiddleware,
} from "../di/place.di";

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), createPlace.handle());
router.put(
  "/:placeId",
  authMiddleware.verify(),
  placesMiddleware.ownership(),
  updatePlace.handle()
);
router.delete(
  "/:placeId",
  authMiddleware.verify(),
  rateLimiterMiddleware.strict(),
  placesMiddleware.ownership(),
  deletePlace.handle()
);
router.get("/search", getPlaces.handle());
router.get("/in-view", getPlacesInView.handle());
router.get("/:placeId", getPlaceById.handle());

export default router;
