import express from "express";
import auth from "../middlewares/auth.js";
import {
  updatePlace,
  getPlaceById,
  getPlacesInView,
} from "../controllers/placeController.js";
import upload from "../middlewares/uploadToS3.js";

const router = express.Router();

router.get("/in-view", getPlacesInView);
router.get("/:id", getPlaceById);
router.put("/:id", auth, upload.single("image"), updatePlace);

export default router;
