import express, { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  authMiddleware,
} from "@src/api/composition/products.composition";

const router: Router = express.Router();

router.post("/", authMiddleware.verify(), createProduct.handle());
router.get("/", getProducts.handle());
router.get("/:productId", getProductById.handle());
router.put(
  "/:productId",
  authMiddleware.verify(),
  updateProduct.handle()
);
router.delete(
  "/:productId",
  authMiddleware.verify(),
  deleteProduct.handle()
);

export default router;
