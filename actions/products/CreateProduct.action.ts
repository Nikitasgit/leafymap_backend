import { IProductRepository } from "@/types/repositories/product.repository.types";
import { Types } from "mongoose";

export const MAX_PRODUCTS_PER_USER = 10;

export interface CreateProductInput {
  productCategory: string;
}

export interface ICreateProductAction {
  execute(params: {
    productData: CreateProductInput;
    userId: string;
  }): Promise<{ _id: string }>;
}

class CreateProductAction implements ICreateProductAction {
  constructor(private productRepository: IProductRepository) {}

  async execute({
    productData,
    userId,
  }: {
    productData: CreateProductInput;
    userId: string;
  }): Promise<{ _id: string }> {
    const existing = await this.productRepository.findAll({
      filters: { user: userId },
      project: ["_id"],
      limit: MAX_PRODUCTS_PER_USER + 1,
    });
    if (existing.length >= MAX_PRODUCTS_PER_USER) {
      const error = new Error(
        "Vous ne pouvez pas ajouter plus de 10 produits."
      ) as Error & { code?: string };
      error.code = "MAX_PRODUCTS_REACHED";
      throw error;
    }

    const newProduct = {
      productCategory: new Types.ObjectId(productData.productCategory),
      user: new Types.ObjectId(userId),
    };

    const productId = await this.productRepository.create(newProduct);
    return { _id: productId.toString() };
  }
}

export default CreateProductAction;
