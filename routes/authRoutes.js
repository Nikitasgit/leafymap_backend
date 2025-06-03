import express from "express";
import { register, signIn, signOut } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/signin", signIn);
router.post("/signout", signOut);

export default router;
