import express, { Router } from "express";
import auth from "../middlewares/auth";
import {
  getUserById,
  getUsers,
  updateUser,
  deleteAccount,
} from "../controllers/userController";
import { strictLimiter } from "../middlewares/rateLimiter";

const router: Router = express.Router();

router.get("/", getUsers);
router.get("/:userId", getUserById);
router.put("/", auth, updateUser);
router.delete("/", auth, strictLimiter, deleteAccount);

export default router;
