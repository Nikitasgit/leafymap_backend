import { Product } from "@src/domain/entities/Product.entity";
import {
  IProductRepository,
  ProductListFilters,
} from "@src/domain/interfaces/IProductRepository";
import {
  ProductId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ProductMapper } from "@src/infrastructure/mappers/Product.mapper";
import ProductModel, {
  ProductDocumentProps,
} from "@src/infrastructure/persistence/schemas/Product.schema";
import { FilterQuery, Types } from "mongoose";

type ProductDocumentWithId = ProductDocumentProps & {
  _id: Types.ObjectId;
};

const PRODUCT_CATEGORY_POPULATE = {
  path: "productCategory",
  select: "name type",
  populate: {
    path: "type",
    select: "name",
  },
};

class MongooseProductRepository implements IProductRepository {
  async save(product: Product): Promise<ProductId> {
    const document = await ProductModel.create(
      ProductMapper.toPersistence(product)
    );
    return ProductId.from(document._id.toString());
  }

  async findById(id: ProductId): Promise<Product | null> {
    const document = await ProductModel.findById(id).lean();
    if (!document) {
      return null;
    }
    return ProductMapper.toDomain(document as ProductDocumentWithId);
  }

  async findDetailsById(
    id: ProductId
  ): Promise<Record<string, unknown> | null> {
    const document = await ProductModel.findById(id)
      .select("_id productCategory user createdAt updatedAt")
      .populate(PRODUCT_CATEGORY_POPULATE)
      .lean();

    if (!document) {
      return null;
    }

    return document as unknown as Record<string, unknown>;
  }

  async update(product: Product): Promise<void> {
    if (!product.id) {
      return;
    }
    await ProductModel.updateOne(
      { _id: product.id },
      {
        productCategory: new Types.ObjectId(product.productCategoryId),
        updatedAt: product.updatedAt,
      }
    ).exec();
  }

  async delete(id: ProductId): Promise<void> {
    await ProductModel.findByIdAndDelete(id).exec();
  }

  async countByUserId(userId: UserId): Promise<number> {
    return ProductModel.countDocuments({
      user: new Types.ObjectId(userId),
    });
  }

  async findList(
    filters: ProductListFilters
  ): Promise<Record<string, unknown>[]> {
    const query = this.buildListQuery(filters);
    const products = await ProductModel.find(query)
      .select("_id productCategory user createdAt updatedAt")
      .populate(PRODUCT_CATEGORY_POPULATE)
      .sort({ createdAt: -1 })
      .limit(filters.limit ?? 100)
      .lean();

    return products as unknown as Record<string, unknown>[];
  }

  async deleteManyByUserId(userId: UserId): Promise<void> {
    await ProductModel.deleteMany({
      user: new Types.ObjectId(userId),
    }).exec();
  }

  private buildListQuery(
    filters: ProductListFilters
  ): FilterQuery<ProductDocumentProps> {
    const query: FilterQuery<ProductDocumentProps> = {};

    if (filters.userId) {
      query.user = new Types.ObjectId(filters.userId);
    }
    if (filters.productCategoryId) {
      query.productCategory = new Types.ObjectId(filters.productCategoryId);
    }

    return query;
  }
}

export default MongooseProductRepository;
