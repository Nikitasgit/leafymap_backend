import express, { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  authMiddleware,
  productsMiddleware,
} from "../di/product.di";

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), createProduct.handle());
router.get("/", getProducts.handle());
router.get("/:productId", getProductById.handle());
router.put(
  "/:productId",
  authMiddleware.verify(),
  productsMiddleware.ownership(),
  updateProduct.handle()
);
router.delete(
  "/:productId",
  authMiddleware.verify(),
  productsMiddleware.ownership(),
  deleteProduct.handle()
);

export default router;
