const Category = require("../models/Category");
const PlaceCategory = require("../models/PlaceCategory");
const SubCategory = require("../models/SubCategory");

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
module.exports = {
  getCategories,
};
