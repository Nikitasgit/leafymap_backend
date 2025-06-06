import express, { Router } from "express";
import { register, signIn, signOut } from "../controllers/authController";

const router: Router = express.Router();

router.post("/register", register);
router.post("/signin", signIn);
router.post("/signout", signOut);

export default router;
