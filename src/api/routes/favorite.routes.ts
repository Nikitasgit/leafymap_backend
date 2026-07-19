import express, { Router } from "express";
import {
  createFavorite,
  deleteFavorite,
  getFavoritesByType,
  authMiddleware,
} from "@src/api/composition/favorites.composition";

const router: Router = express.Router();

router.get("/", authMiddleware.verify(), getFavoritesByType.handle());
router.post("/", authMiddleware.verify(), createFavorite.handle());
router.delete("/", authMiddleware.verify(), deleteFavorite.handle());

export default router;
