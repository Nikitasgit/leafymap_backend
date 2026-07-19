import {
  getProductsQuerySchema,
  newProductSchema,
  updateProductSchema,
} from "@src/api/dto/products/product.dto";
import { Types } from "mongoose";

const validId = () => new Types.ObjectId().toString();

describe("product dto validations", () => {
  describe("newProductSchema", () => {
    it("accepts a valid product category id", () => {
      const result = newProductSchema.safeParse({
        productCategory: validId(),
      });
      expect(result.success).toBe(true);
    });

    it("rejects a missing product category", () => {
      const result = newProductSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it("rejects an invalid object id", () => {
      const result = newProductSchema.safeParse({
        productCategory: "not-an-id",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateProductSchema", () => {
    it("accepts an empty body", () => {
      const result = updateProductSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("getProductsQuerySchema", () => {
    it("coerces limit to a number", () => {
      const result = getProductsQuerySchema.safeParse({
        limit: "25",
        userId: validId(),
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(25);
      }
    });

    it("rejects an invalid userId", () => {
      const result = getProductsQuerySchema.safeParse({
        userId: "bad",
      });
      expect(result.success).toBe(false);
    });
  });
});
