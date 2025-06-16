import express, { Router } from "express";
import auth from "../middlewares/auth";
import upload from "../middlewares/uploadToS3";
import { getEventById, updateEvent } from "../controllers/eventController";

const router: Router = express.Router();

router.get("/:id", getEventById);

export default router;
