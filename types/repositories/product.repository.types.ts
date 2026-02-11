import { IProduct } from "../models/product";
import { Types } from "mongoose";

export interface ProductFilters {
  _id?: string | { $in: string[] };
  user?: string;
  productCategory?: string | { $in: string[] };
  [key: string]: unknown;
}

export interface IProductRepository {
  create(product: Partial<IProduct>): Promise<Types.ObjectId>;
  createMany(products: Partial<IProduct>[]): Promise<Types.ObjectId[]>;
  findById(
    id: string,
    project?: (keyof IProduct | string)[]
  ): Promise<IProduct | null>;
  findAll<K extends keyof IProduct>(params: {
    filters?: ProductFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IProduct, K>[]>;
  updateOne(id: string, update: Partial<IProduct>): Promise<void>;
  deleteOne(id: string): Promise<void>;
  deleteMany(filters: ProductFilters): Promise<void>;
}
