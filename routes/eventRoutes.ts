import express, { Router } from "express";
import { getEventById } from "../controllers/eventController";

const router: Router = express.Router();

router.get("/:eventId", getEventById);

export default router;
