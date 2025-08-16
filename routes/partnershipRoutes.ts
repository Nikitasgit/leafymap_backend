import express, { Router } from "express";
import auth from "../middlewares/auth";
import {
  createPartnerships,
  getPartnerships,
  updatePartnerships,
} from "../controllers/partnershipController";

const router: Router = express.Router();

router.get("/:placeId/:eventId?", getPartnerships);
router.put("/:placeId/:eventId?", auth, updatePartnerships);
router.post("/:placeId/:eventId?", auth, createPartnerships);

export default router;
