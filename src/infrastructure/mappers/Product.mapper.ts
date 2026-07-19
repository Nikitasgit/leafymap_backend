import { Product } from "@src/domain/entities/Product.entity";
import {
  ProductCategoryId,
  ProductId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ProductDocumentProps } from "@src/infrastructure/persistence/schemas/Product.schema";
import { Types } from "mongoose";

export class ProductMapper {
  static toDomain(
    doc: ProductDocumentProps & { _id: Types.ObjectId }
  ): Product {
    return Product.reconstitute({
      id: ProductId.from(doc._id.toString()),
      userId: UserId.from(doc.user.toString()),
      productCategoryId: ProductCategoryId.from(doc.productCategory.toString()),
      createdAt: doc.createdAt ?? new Date(),
      updatedAt: doc.updatedAt ?? new Date(),
    });
  }

  static toPersistence(
    product: Product
  ): Omit<ProductDocumentProps, "_id"> {
    return {
      productCategory: new Types.ObjectId(product.productCategoryId),
      user: new Types.ObjectId(product.userId),
    };
  }
}
