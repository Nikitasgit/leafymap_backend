import Product from "../models/Product";
import { IProduct } from "@/types/models/product";
import {
  IProductRepository,
  ProductFilters,
} from "@/types/repositories/product.repository.types";
import { Types, FilterQuery } from "mongoose";
import { PopulateParser } from "./utils/PopulateParser";

class ProductRepository implements IProductRepository {
  private buildQuery(filters?: ProductFilters): FilterQuery<IProduct> {
    const query: FilterQuery<IProduct> = {};

    if (!filters) return query;

    if (filters._id) {
      if (typeof filters._id === "string") {
        query._id = new Types.ObjectId(filters._id);
      } else if ("$in" in filters._id) {
        query._id = {
          $in: filters._id.$in.map((id) => new Types.ObjectId(id)),
        };
      }
    }
    if (filters.user) {
      query.user = new Types.ObjectId(filters.user);
    }
    if (filters.productCategory) {
      if (
        typeof filters.productCategory === "object" &&
        "$in" in filters.productCategory
      ) {
        query.productCategory = {
          $in: (filters.productCategory.$in as string[]).map(
            (id) => new Types.ObjectId(id)
          ),
        };
      } else {
        query.productCategory = new Types.ObjectId(
          filters.productCategory as string
        );
      }
    }

    Object.keys(filters).forEach((key) => {
      if (!["_id", "user", "productCategory"].includes(key)) {
        (query as Record<string, unknown>)[key] = (
          filters as Record<string, unknown>
        )[key];
      }
    });

    return query;
  }

  async create(product: Partial<IProduct>): Promise<Types.ObjectId> {
    const newProduct = new Product(product);
    await newProduct.save();
    return newProduct._id;
  }

  async createMany(products: Partial<IProduct>[]): Promise<Types.ObjectId[]> {
    const created = await Product.insertMany(products);
    return created.map((p) => p._id);
  }

  async findById(
    id: string,
    project?: (keyof IProduct | string)[]
  ): Promise<IProduct | null> {
    let query = Product.findById(id);

    if (project && project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" "));
      }

      query = PopulateParser.applyPopulate(
        query,
        populateConfig
      ) as typeof query;
    }

    const product = await query.lean();
    return product as IProduct | null;
  }

  async findAll<K extends keyof IProduct>(params: {
    filters?: ProductFilters;
    project: (K | string)[];
    limit?: number;
    sort?: { [key: string]: 1 | -1 };
  }): Promise<Pick<IProduct, K>[]> {
    const query = this.buildQuery(params.filters);

    let mongooseQuery = Product.find(query);

    if (params.sort) {
      mongooseQuery = mongooseQuery.sort(params.sort);
    }

    if (params.limit) {
      mongooseQuery = mongooseQuery.limit(params.limit);
    }

    if (params.project && params.project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(params.project);

      if (selectFields.length > 0) {
        mongooseQuery = mongooseQuery.select(selectFields.join(" "));
      }

      mongooseQuery = PopulateParser.applyPopulate(
        mongooseQuery,
        populateConfig
      ) as typeof mongooseQuery;
    }

    const products = await mongooseQuery.lean();
    return products as unknown as Pick<IProduct, K>[];
  }

  async updateOne(id: string, update: Partial<IProduct>): Promise<void> {
    await Product.findByIdAndUpdate(id, update).exec();
  }

  async deleteOne(id: string): Promise<void> {
    await Product.findByIdAndDelete(id).exec();
  }

  async deleteMany(filters: ProductFilters): Promise<void> {
    const query = this.buildQuery(filters);
    await Product.deleteMany(query).exec();
  }
}

export default ProductRepository;
