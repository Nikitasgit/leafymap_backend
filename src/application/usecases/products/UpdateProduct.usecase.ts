import { IProductRepository } from "@src/domain/interfaces/IProductRepository";
import {
  ProductCategoryId,
  ProductId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";
import { UpdateProductInput } from "@src/application/dtos/products/updateProduct.dto";

class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(params: UpdateProductInput): Promise<void> {
    const productId = ProductId.from(params.productId);
    const userId = UserId.from(params.userId);

    const existing = await this.productRepository.findById(productId);
    if (!existing) {
      throw new NotFoundError(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        "Product not found"
      );
    }

    if (!existing.belongsTo(userId)) {
      throw new ForbiddenError(
        ERROR_CODES.PRODUCT_FORBIDDEN,
        "You don't have permission to update this product"
      );
    }

    if (!params.productCategoryId) {
      return;
    }

    const updated = existing.changeCategory(
      ProductCategoryId.from(params.productCategoryId)
    );
    await this.productRepository.update(updated);
  }
}

export default UpdateProductUseCase;
