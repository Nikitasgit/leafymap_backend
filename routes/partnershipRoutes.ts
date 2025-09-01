import express, { Router } from "express";
import auth from "../middlewares/auth";
import {
  createPartnerships,
  getPartnerships,
  getPartnershipsByUserId,
  updatePartnerships,
} from "../controllers/partnershipController";
import placeOwnership from "../middlewares/placeOwnership";

const router: Router = express.Router();

router.get("/user/:userId", getPartnershipsByUserId);
router.get("/:placeId/:eventId?", getPartnerships);
router.put("/:placeId/:eventId?", auth, updatePartnerships);
router.post("/:placeId/:eventId?", auth, placeOwnership, createPartnerships);

export default router;
