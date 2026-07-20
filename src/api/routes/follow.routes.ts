import express, { Router } from "express";
import { cradle } from "@src/di/container";

const { followsController, authMiddleware } = cradle;

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), followsController.create());
router.get("/check", authMiddleware.verify(), followsController.getOne());
router.get("/followers/:userId", followsController.listFollowers());
router.get("/following/:userId", followsController.listFollowing());
router.delete("/:followId", authMiddleware.verify(), followsController.delete());

export default router;
