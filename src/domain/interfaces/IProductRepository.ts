import { Product } from "@src/domain/entities/Product.entity";
import {
  ProductCategoryId,
  ProductId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";

export interface ProductListFilters {
  userId?: UserId;
  productCategoryId?: ProductCategoryId;
  limit?: number;
}

export interface IProductRepository {
  save(product: Product): Promise<ProductId>;
  findById(id: ProductId): Promise<Product | null>;
  findDetailsById(id: ProductId): Promise<Record<string, unknown> | null>;
  update(product: Product): Promise<void>;
  delete(id: ProductId): Promise<void>;
  countByUserId(userId: UserId): Promise<number>;
  findList(filters: ProductListFilters): Promise<Record<string, unknown>[]>;
  deleteManyByUserId(userId: UserId): Promise<void>;
}
