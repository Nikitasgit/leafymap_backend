import { Request, Response } from "express";
import PlaceCategory from "../models/PlaceCategory";
import SubCategory from "../models/SubCategory";
import Category from "../models/Category";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";

const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorCategories = await SubCategory.find().populate("category");
    const placeCategories = await PlaceCategory.find();
    APIResponse(
      res,
      { creatorCategories, placeCategories },
      "Categories fetched successfully",
      200
    );
  } catch (error) {
    APIResponse(res, null, "Server error", 500);
    logger.error("Error in getCategories:", error);
  }
};

export { getCategories };
