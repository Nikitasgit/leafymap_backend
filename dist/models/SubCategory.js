"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const subcategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
});
exports.default = (0, mongoose_1.model)("SubCategory", subcategorySchema);
