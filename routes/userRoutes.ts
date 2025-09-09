import express, { Router } from "express";
import auth from "../middlewares/auth";
import {
  getUserById,
  getUsers,
  updateUser,
} from "../controllers/userController";

const router: Router = express.Router();

router.get("/", getUsers);
router.get("/:userId", getUserById);
router.put("/", auth, updateUser);

export default router;
