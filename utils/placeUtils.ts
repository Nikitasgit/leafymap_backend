import SubCategory from "../models/SubCategory";
import logger from "./logger";
import { PlaceType } from "../types/models/place";

interface PopulatedSubCategory {
  _id: string;
  name: string;
  category: {
    _id: string;
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export const getCategoryNameFromSubCategory = async (
  subCategoryId: string
): Promise<PlaceType[]> => {
  try {
    const subCategory: PopulatedSubCategory | null = await SubCategory.findById(
      subCategoryId
    ).populate("category");
    if (subCategory) {
      return [subCategory.category.name as PlaceType];
    }
  } catch (error) {
    logger.error("Error getting place type from category:", error);
  }
  return ["art"];
};
