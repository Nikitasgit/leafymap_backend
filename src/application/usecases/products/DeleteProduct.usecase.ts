import { IProductRepository } from "@src/domain/interfaces/IProductRepository";
import {
  ProductId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";
import { DeleteProductInput } from "@src/application/dtos/products/deleteProduct.dto";

class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(params: DeleteProductInput): Promise<void> {
    const productId = ProductId.from(params.productId);
    const userId = UserId.from(params.userId);

    const existing = await this.productRepository.findById(productId);
    if (!existing || !existing.id) {
      throw new NotFoundError(
        ERROR_CODES.PRODUCT_NOT_FOUND,
        "Product not found"
      );
    }

    if (!existing.belongsTo(userId)) {
      throw new ForbiddenError(
        ERROR_CODES.PRODUCT_FORBIDDEN,
        "You don't have permission to delete this product"
      );
    }

    await this.productRepository.delete(existing.id);
  }
}

export default DeleteProductUseCase;
