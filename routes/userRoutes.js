import express from "express";
import auth from "../middlewares/auth.js";
import upload from "../middlewares/uploadToS3.js";
import {
  getUser,
  updateCreator,
  addCreator,
  addOrganizer,
  findUsers,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/create-creator", auth, upload.single("image"), addCreator);
router.post("/create-organizer", auth, upload.single("image"), addOrganizer);
router.put("/update-creator", auth, upload.single("image"), updateCreator);
router.get("/profile", auth, getUser);

router.get("/find-users", findUsers);

export default router;
