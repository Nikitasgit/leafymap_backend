import { IProductCategory } from "../models/productCategory";

export interface IProductCategoryRepository {
  findAll(params: {
    project?: (keyof IProductCategory | string)[];
    sort?: { [key: string]: 1 | -1 };
  }): Promise<IProductCategory[]>;
}
