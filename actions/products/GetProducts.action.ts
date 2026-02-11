import {
  IProductRepository,
  ProductFilters,
} from "@/types/repositories/product.repository.types";
import { IProduct } from "@/types/models/product";

export interface GetProductsInput {
  userId?: string;
  productCategoryId?: string;
  limit?: number;
}

export interface IGetProductsAction {
  execute(params: { filters?: GetProductsInput }): Promise<
    (IProduct | Partial<IProduct>)[]
  >;
}

class GetProductsAction implements IGetProductsAction {
  private readonly project: (keyof IProduct | string)[] = [
    "_id",
    "productCategory",
    "user",
    "productCategory.name",
    "productCategory.category",
    "productCategory.category.name",
    "createdAt",
    "updatedAt",
  ];

  constructor(private productRepository: IProductRepository) {}

  async execute({
    filters,
  }: {
    filters?: GetProductsInput;
  }): Promise<(IProduct | Partial<IProduct>)[]> {
    const queryFilters: ProductFilters = {};
    if (filters?.userId) {
      queryFilters.user = filters.userId;
    }
    if (filters?.productCategoryId) {
      queryFilters.productCategory = filters.productCategoryId;
    }

    const products = await this.productRepository.findAll({
      filters: Object.keys(queryFilters).length > 0 ? queryFilters : undefined,
      project: this.project,
      limit: filters?.limit ?? 100,
      sort: { createdAt: -1 },
    });

    return products;
  }
}

export default GetProductsAction;
