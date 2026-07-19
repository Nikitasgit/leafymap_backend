import { Types } from "mongoose";
import {
  MAX_PRODUCTS_PER_USER,
  Product,
} from "@src/domain/entities/Product.entity";
import {
  ProductCategoryId,
  ProductId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

const mockObjectId = (): string => new Types.ObjectId().toString();

describe("Product entity", () => {
  const userId = UserId.from(mockObjectId());
  const productCategoryId = ProductCategoryId.from(mockObjectId());

  it("creates a product without id", () => {
    const product = Product.create({ userId, productCategoryId });

    expect(product.id).toBeNull();
    expect(product.userId).toBe(userId);
    expect(product.productCategoryId).toBe(productCategoryId);
    expect(product.belongsTo(userId)).toBe(true);
  });

  it("reconstitutes a product", () => {
    const id = ProductId.from(mockObjectId());
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const updatedAt = new Date("2026-01-02T00:00:00.000Z");

    const product = Product.reconstitute({
      id,
      userId,
      productCategoryId,
      createdAt,
      updatedAt,
    });

    expect(product.id).toBe(id);
    expect(product.createdAt).toBe(createdAt);
    expect(product.updatedAt).toBe(updatedAt);
  });

  it("changes category and updates timestamp", () => {
    const product = Product.reconstitute({
      id: ProductId.from(mockObjectId()),
      userId,
      productCategoryId,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const nextCategoryId = ProductCategoryId.from(mockObjectId());

    const updated = product.changeCategory(nextCategoryId);

    expect(updated.productCategoryId).toBe(nextCategoryId);
    expect(updated.updatedAt.getTime()).toBeGreaterThan(
      product.updatedAt.getTime()
    );
  });

  it("belongsTo returns false for another user", () => {
    const product = Product.create({ userId, productCategoryId });
    expect(product.belongsTo(UserId.from(mockObjectId()))).toBe(false);
  });

  it("exposes MAX_PRODUCTS_PER_USER", () => {
    expect(MAX_PRODUCTS_PER_USER).toBe(10);
  });
});
