import express, { Router } from "express";
import {
  register,
  signIn,
  signOut,
  getCurrentUser,
  authMiddleware,
  rateLimiterMiddleware,
} from "../di/auth.di";

const router: Router = express.Router();

router.post("/register", rateLimiterMiddleware.auth(), register.handle());
router.post("/signin", rateLimiterMiddleware.auth(), signIn.handle());
router.post("/signout", signOut.handle());
router.get("/me", authMiddleware.verify(), getCurrentUser.handle());

export default router;
