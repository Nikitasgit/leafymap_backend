import { IProductRepository } from "@/types/repositories/product.repository.types";
import { IProduct } from "@/types/models/product";
import { Types } from "mongoose";

export interface UpdateProductInput {
  productCategory?: string;
}

export interface IUpdateProductAction {
  execute(params: {
    productId: string;
    updateData: UpdateProductInput;
  }): Promise<void>;
}

class UpdateProductAction implements IUpdateProductAction {
  constructor(private productRepository: IProductRepository) {}

  async execute({
    productId,
    updateData,
  }: {
    productId: string;
    updateData: UpdateProductInput;
  }): Promise<void> {
    const update: Partial<IProduct> = {};
    if (updateData.productCategory) {
      update.productCategory = new Types.ObjectId(updateData.productCategory);
    }
    await this.productRepository.updateOne(productId, update);
  }
}

export default UpdateProductAction;
