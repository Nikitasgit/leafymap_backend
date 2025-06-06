import { Request, Response } from "express";
import Category from "../models/Category";
import PlaceCategory from "../models/PlaceCategory";
import SubCategory from "../models/SubCategory";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";

const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const subCategories = await SubCategory.find();
    const categories = await Category.find();
    const placeCategories = await PlaceCategory.find();
    APIResponse(
      res,
      { subCategories, categories, placeCategories },
      "Categories fetched successfully",
      200
    );
  } catch (error) {
    APIResponse(res, null, "Server error", 500);
    logger.error("Error in getCategories:", error);
  }
};

export { getCategories };
