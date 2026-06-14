import ProductCategory from "../models/ProductCategory";
import { IProductCategory } from "@/types/models/productCategory";
import { IProductCategoryRepository } from "@/types/repositories/productCategory.repository.types";
import { PopulateParser } from "./utils/PopulateParser";

class ProductCategoryRepository implements IProductCategoryRepository {
  async findAll(params?: {
    project?: (keyof IProductCategory | string)[];
    sort?: { [key: string]: 1 | -1 };
  }): Promise<IProductCategory[]> {
    const project = params?.project ?? [
      "_id",
      "name",
      "type",
      "type.name",
    ];
    const sort = params?.sort ?? { name: 1 };

    let query = ProductCategory.find();

    if (project.length > 0) {
      const { selectFields, populateConfig } =
        PopulateParser.parseProjectFields(project);

      if (selectFields.length > 0) {
        query = query.select(selectFields.join(" "));
      }

      query = PopulateParser.applyPopulate(
        query,
        populateConfig
      ) as typeof query;
    }

    query = query.sort(sort);
    const categories = await query.lean();
    return categories as IProductCategory[];
  }
}

export default ProductCategoryRepository;
