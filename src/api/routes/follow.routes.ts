import express, { Router } from "express";
import {
  createFollow,
  deleteFollow,
  getFollowers,
  getFollowing,
  getOneFollow,
  authMiddleware,
} from "@src/api/composition/follows.composition";

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), createFollow.handle());
router.get("/check", authMiddleware.verify(), getOneFollow.handle());
router.get("/followers/:userId", getFollowers.handle());
router.get("/following/:userId", getFollowing.handle());
router.delete("/:followId", authMiddleware.verify(), deleteFollow.handle());

export default router;
