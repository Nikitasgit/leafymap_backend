import { IProductRepository } from "@/types/repositories/product.repository.types";

export interface IDeleteProductAction {
  execute(params: { productId: string }): Promise<void>;
}

class DeleteProductAction implements IDeleteProductAction {
  constructor(private productRepository: IProductRepository) {}

  async execute({ productId }: { productId: string }): Promise<void> {
    const product = await this.productRepository.findById(productId, ["_id"]);

    if (!product) {
      throw new Error("Product not found");
    }

    await this.productRepository.deleteOne(productId);
  }
}

export default DeleteProductAction;
