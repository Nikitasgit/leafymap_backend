"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryNameFromSubCategory = void 0;
const SubCategory_1 = __importDefault(require("../models/SubCategory"));
const logger_1 = __importDefault(require("./logger"));
const getCategoryNameFromSubCategory = async (subCategoryId) => {
    try {
        const subCategory = await SubCategory_1.default.findById(subCategoryId).populate("category");
        if (subCategory) {
            return [subCategory.category.name];
        }
    }
    catch (error) {
        logger_1.default.error("Error getting place type from category:", error);
    }
    return ["art"];
};
exports.getCategoryNameFromSubCategory = getCategoryNameFromSubCategory;
