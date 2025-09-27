import express, { Router } from "express";
import {
  register,
  signIn,
  signOut,
  getCurrentUser,
} from "../controllers/authController";
import auth from "../middlewares/auth";

const router: Router = express.Router();

router.post("/register", register);
router.post("/signin", signIn);
router.post("/signout", signOut);
router.get("/me", auth, getCurrentUser);

export default router;
