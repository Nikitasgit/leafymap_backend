import { IProductRepository } from "@/types/repositories/product.repository.types";
import { IProduct } from "@/types/models/product";

export interface IGetProductByIdAction {
  execute(productId: string): Promise<IProduct | null>;
}

class GetProductByIdAction implements IGetProductByIdAction {
  private readonly project: (keyof IProduct | string)[] = [
    "_id",
    "productCategory",
    "user",
    "productCategory.name",
    "productCategory.type",
    "productCategory.type.name",
    "createdAt",
    "updatedAt",
  ];

  constructor(private productRepository: IProductRepository) {}

  async execute(productId: string): Promise<IProduct | null> {
    return this.productRepository.findById(productId, this.project);
  }
}

export default GetProductByIdAction;
