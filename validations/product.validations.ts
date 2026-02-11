import { z } from "zod";

export const productCategorySchema = z
  .string()
  .min(1, "La catégorie du produit est requise");

export const newProductSchema = z.object({
  productCategory: productCategorySchema,
});

export const updateProductSchema = newProductSchema.partial();
