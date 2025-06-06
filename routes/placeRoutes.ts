import express, { Router, Request } from "express";
import auth from "../middlewares/auth";
import {
  updatePlace,
  getPlaceById,
  getPlacesInView,
} from "../controllers/placeController";
import upload from "../middlewares/uploadToS3";



const router: Router = express.Router();

router.get("/in-view", getPlacesInView);
router.get("/:id", getPlaceById);
router.put("/:id", auth, upload.single("image"), updatePlace);

export default router;
