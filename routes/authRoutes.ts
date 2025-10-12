import express, { Router } from "express";
import {
  register,
  signIn,
  signOut,
  getCurrentUser,
} from "../controllers/authController";
import auth from "../middlewares/auth";
import { authLimiter } from "../middlewares/rateLimiter";

const router: Router = express.Router();

// Apply rate limiting to authentication routes to prevent brute force attacks
router.post("/register", authLimiter, register);
router.post("/signin", authLimiter, signIn);
router.post("/signout", signOut);
router.get("/me", auth, getCurrentUser);

export default router;
