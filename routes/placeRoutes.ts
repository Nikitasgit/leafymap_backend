import express, { Router } from "express";
import auth from "../middlewares/auth";
import {
  updatePlace,
  getPlaceById,
  getPlacesInView,
  getPlacesBySearch,
} from "../controllers/placeController";
import upload from "../middlewares/uploadToS3";
import {
  createEvent,
  getEventsByPlaceId,
  updateEvent,
} from "../controllers/eventController";

const router: Router = express.Router();

router.post("/:placeId/events", auth, upload.single("image"), createEvent);

router.get("/in-view", getPlacesInView);
router.get("/search", getPlacesBySearch);
router.get("/:id", getPlaceById);
router.get("/:id/events", getEventsByPlaceId);

router.put("/:id", auth, upload.single("image"), updatePlace);
router.put(
  "/:placeId/events/:eventId",
  auth,
  upload.single("image"),
  updateEvent
);

export default router;
