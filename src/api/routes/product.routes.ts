import express, { Router } from "express";
import { cradle } from "@src/di/container";

const { productsController, authMiddleware } = cradle;

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), productsController.create());
router.get("/", productsController.list());
router.get("/:productId", productsController.getById());
router.put(
  "/:productId",
  authMiddleware.verify(),
  productsController.update()
);
router.delete(
  "/:productId",
  authMiddleware.verify(),
  productsController.delete()
);

export default router;
