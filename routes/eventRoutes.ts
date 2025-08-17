import express, { Router } from "express";
import { getEventById } from "../controllers/eventController";

const router: Router = express.Router();

router.get("/:id", getEventById);

export default router;
