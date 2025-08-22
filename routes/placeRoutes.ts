import express, { Router } from "express";
import auth from "../middlewares/auth";
import placeOwnership from "../middlewares/placeOwnership";
import {
  updatePlace,
  createPlace,
  getPlaceById,
  getPlacesInView,
  searchPlaces,
} from "../controllers/placeController";

const router: Router = express.Router();

router.post("/", auth, createPlace);
router.put("/:placeId", auth, placeOwnership, updatePlace);
router.get("/search", searchPlaces);
router.get("/in-view", getPlacesInView);
router.get("/:placeId", getPlaceById);

export default router;
