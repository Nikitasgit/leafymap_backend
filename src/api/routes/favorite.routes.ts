import express, { Router } from "express";
import { cradle } from "@src/di/container";

const { favoritesController, authMiddleware } = cradle;

const router: Router = express.Router();

router.get("/", authMiddleware.verify(), favoritesController.listByType());
router.post("/", authMiddleware.verify(), favoritesController.create());
router.delete("/", authMiddleware.verify(), favoritesController.delete());

export default router;
