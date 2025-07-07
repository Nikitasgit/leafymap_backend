import express, { Router } from "express";
import {
  register,
  signIn,
  signOut,
  verifyToken,
} from "../controllers/authController";

const router: Router = express.Router();

router.post("/register", register);
router.post("/signin", signIn);
router.post("/signout", signOut);
router.get("/verify", verifyToken);

export default router;
