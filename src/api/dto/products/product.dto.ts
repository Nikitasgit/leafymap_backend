import { z } from "zod";
import { objectIdString } from "@src/api/dto/common.dto";
import { isValidObjectId } from "@src/api/http/objectId";

export const productCategorySchema = z
  .string()
  .min(1, "La catégorie du produit est requise")
  .refine(isValidObjectId, { message: "Invalid ObjectId" });

export const newProductSchema = z.object({
  productCategory: productCategorySchema,
});

export const updateProductSchema = newProductSchema.partial();

export const getProductsQuerySchema = z.object({
  userId: objectIdString.optional(),
  productCategoryId: objectIdString.optional(),
  limit: z.coerce.number().optional(),
});
