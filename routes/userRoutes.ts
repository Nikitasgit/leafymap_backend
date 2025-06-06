import express, { Router, Request, Response, NextFunction } from "express";
import auth from "../middlewares/auth";
import upload from "../middlewares/uploadToS3";
import {
  getUser,
  updateCreator,
  addCreator,
  addOrganizer,
  findUsers,
} from "../controllers/userController";

interface AuthRequest extends Request {
  user?: any;
  file?: Express.Multer.File & { location?: string };
}

const router: Router = express.Router();

router.post(
  "/create-creator",
  auth as any,
  upload.single("image"),
  addCreator as any
);
router.post(
  "/create-organizer",
  auth as any,
  upload.single("image"),
  addOrganizer as any
);
router.put(
  "/update-creator",
  auth as any,
  upload.single("image"),
  updateCreator as any
);
router.get("/profile", auth as any, getUser as any);
router.get("/find-users", findUsers as any);

export default router;
