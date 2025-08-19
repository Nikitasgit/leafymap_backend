"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = void 0;
const PlaceCategory_1 = __importDefault(require("../models/PlaceCategory"));
const SubCategory_1 = __importDefault(require("../models/SubCategory"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const getCategories = async (req, res) => {
    try {
        const creatorCategories = await SubCategory_1.default.find().populate("category");
        const placeCategories = await PlaceCategory_1.default.find();
        (0, response_1.APIResponse)(res, { creatorCategories, placeCategories }, "Categories fetched successfully", 200);
    }
    catch (error) {
        (0, response_1.APIResponse)(res, null, "Server error", 500);
        logger_1.default.error("Error in getCategories:", error);
    }
};
exports.getCategories = getCategories;
