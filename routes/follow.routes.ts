import express, { Router } from "express";
import {
  createFollow,
  deleteFollow,
  findFollowers,
  findFollowing,
  findOneFollow,
  authMiddleware,
  rateLimiterMiddleware,
} from "../di/follow.di";

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), createFollow.handle());
router.get("/check", authMiddleware.verify(), findOneFollow.handle());
router.get("/followers/:userId", findFollowers.handle());
router.get("/following/:userId", findFollowing.handle());
router.delete("/:followId", authMiddleware.verify(), deleteFollow.handle());

export default router;
