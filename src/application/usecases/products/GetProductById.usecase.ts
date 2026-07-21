import { IProductRepository } from "@src/domain/interfaces/IProductRepository";
import { ProductDetailsReadModel } from "@src/domain/read-models/product.read-models";
import { ProductId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";
import { GetProductByIdInput } from "@src/application/dtos/products/getProductById.dto";

class GetProductByIdUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(params: GetProductByIdInput): Promise<ProductDetailsReadModel> {
    const product = await this.productRepository.findDetailsById(
      ProductId.from(params.productId)
    );

    if (!product) {
      throw new NotFoundError(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        "Product not found"
      );
    }

    return product;
  }
}

export default GetProductByIdUseCase;
