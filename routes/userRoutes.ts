import express, { Router } from "express";
import auth from "../middlewares/auth";
import {
  getUserById,
  findCreators,
  getUserInPlacesAndEvents,
  updateUser,
} from "../controllers/userController";

const router: Router = express.Router();

router.get("/find-creators", auth, findCreators);
router.get("/creator-in-places-and-events", getUserInPlacesAndEvents);
router.get("/:userId", getUserById);
router.put("/", auth, updateUser);

export default router;
