import Category from "../models/Category.js";
import PlaceCategory from "../models/PlaceCategory.js";
import SubCategory from "../models/SubCategory.js";

const getCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find();
    const categories = await Category.find();
    const placeCategories = await PlaceCategory.find();

    res.status(200).json({ subCategories, categories, placeCategories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getCategories };
