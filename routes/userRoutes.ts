import express, { Router } from "express";
import auth from "../middlewares/auth";
import {
  getUserById,
  getUsers,
  updateUser,
  deleteAccount,
} from "../controllers/userController";

const router: Router = express.Router();

router.get("/", getUsers);
router.get("/:userId", getUserById);
router.put("/", auth, updateUser);
router.delete("/", auth, deleteAccount);

export default router;
