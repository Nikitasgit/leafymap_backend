import { IProductRepository } from "@src/domain/interfaces/IProductRepository";
import { ProductListItemReadModel } from "@src/domain/read-models/product.read-models";
import {
  ProductCategoryId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { GetProductsInput } from "@src/application/dtos/products/getProducts.dto";

class GetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(params: GetProductsInput): Promise<ProductListItemReadModel[]> {
    return this.productRepository.findList({
      userId: params.userId ? UserId.from(params.userId) : undefined,
      productCategoryId: params.productCategoryId
        ? ProductCategoryId.from(params.productCategoryId)
        : undefined,
      limit: params.limit,
    });
  }
}

export default GetProductsUseCase;
