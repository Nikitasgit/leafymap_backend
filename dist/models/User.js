"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const countries_1 = require("../utils/constants/countries");
const addressSchema = new mongoose_1.Schema({
    number: { type: String },
    street: { type: String, required: true },
    code: { type: String, required: true },
    extra: { type: String },
});
const creatorProfileSchema = new mongoose_1.Schema({
    categories: [{ type: mongoose_1.Types.ObjectId, ref: "SubCategory" }],
    place: { type: mongoose_1.Types.ObjectId, ref: "Place" },
    name: { type: String, required: true },
});
const userSchema = new mongoose_1.Schema({
    firstname: { type: String },
    lastname: { type: String },
    username: { type: String, required: true, unique: true },
    creatorName: { type: String },
    creatorCategories: [{ type: mongoose_1.Types.ObjectId, ref: "SubCategory" }],
    email: { type: String, required: true, unique: true },
    website: { type: String },
    phone: { type: String },
    password: { type: String, required: true },
    userType: {
        type: String,
        enum: ["creator", "organizer", "guest"],
        required: true,
        default: "guest",
    },
    deleted: { type: Boolean, default: false },
    address: addressSchema,
    description: { type: String, maxlength: 300 },
    country: { type: String, enum: countries_1.ISO_COUNTRIES_ALPHA2 },
    image: { type: String },
    followers: [{ type: mongoose_1.Types.ObjectId, ref: "User" }],
    creatorProfile: creatorProfileSchema,
    interests: [{ type: mongoose_1.Types.ObjectId, ref: "SubCategory" }],
    places: [{ type: mongoose_1.Types.ObjectId, ref: "Place" }],
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("User", userSchema);
