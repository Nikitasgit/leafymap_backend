import {
  MAX_PRODUCTS_PER_USER,
  Product,
} from "@src/domain/entities/Product.entity";
import { IProductRepository } from "@src/domain/interfaces/IProductRepository";
import {
  ProductCategoryId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { ConflictError, ERROR_CODES } from "@src/shared/errors";
import {
  CreateProductInput,
  CreateProductOutput,
} from "@src/application/dtos/products/createProduct.dto";

class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(params: CreateProductInput): Promise<CreateProductOutput> {
    const userId = UserId.from(params.userId);
    const productCategoryId = ProductCategoryId.from(params.productCategoryId);

    const count = await this.productRepository.countByUserId(userId);
    if (count >= MAX_PRODUCTS_PER_USER) {
      throw new ConflictError(
        ERROR_CODES.MAX_PRODUCTS_REACHED,
        "Vous ne pouvez pas ajouter plus de 10 produits."
      );
    }

    const product = Product.create({
      userId,
      productCategoryId,
    });

    const id = await this.productRepository.save(product);
    return { id };
  }
}

export default CreateProductUseCase;
