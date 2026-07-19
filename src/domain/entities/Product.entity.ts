import {
  ProductCategoryId,
  ProductId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export const MAX_PRODUCTS_PER_USER = 10;

export interface CreateProductParams {
  userId: UserId;
  productCategoryId: ProductCategoryId;
}

export interface ReconstituteProductParams {
  id: ProductId;
  userId: UserId;
  productCategoryId: ProductCategoryId;
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  private constructor(
    public readonly id: ProductId | null,
    public readonly userId: UserId,
    public readonly productCategoryId: ProductCategoryId,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  static create(params: CreateProductParams): Product {
    const now = new Date();
    return new Product(
      null,
      params.userId,
      params.productCategoryId,
      now,
      now
    );
  }

  static reconstitute(params: ReconstituteProductParams): Product {
    return new Product(
      params.id,
      params.userId,
      params.productCategoryId,
      params.createdAt,
      params.updatedAt
    );
  }

  changeCategory(productCategoryId: ProductCategoryId): Product {
    return new Product(
      this.id,
      this.userId,
      productCategoryId,
      this.createdAt,
      new Date()
    );
  }

  belongsTo(userId: UserId): boolean {
    return this.userId === userId;
  }
}
