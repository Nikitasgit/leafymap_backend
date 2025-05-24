const mongoose = require("mongoose");
const { ISO_COUNTRIES_ALPHA2 } = require("../utils/constants/countries");
const { Schema, model, Types } = mongoose;

const addressSchema = new Schema({
  number: { type: String },
  street: { type: String, required: true },
  code: { type: String, required: true },
  extra: { type: String },
});

const creatorProfileSchema = new Schema({
  categories: [{ type: Types.ObjectId, ref: "SubCategory" }],
  creatorPlace: { type: Types.ObjectId, ref: "Place" },
  creatorName: { type: String, required: true },
});

const userSchema = new Schema(
  {
    firstname: { type: String },
    lastname: { type: String },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    userType: {
      type: String,
      enum: ["creator", "organizer", "guest"],
      required: true,
      default: "guest",
    },
    deleted: { type: Boolean, default: false },
    address: addressSchema,
    description: { type: String },
    country: { type: String, enum: ISO_COUNTRIES_ALPHA2 },
    userImg: { type: String },
    followers: [{ type: Types.ObjectId, ref: "User" }],
    creatorProfile: creatorProfileSchema,
    interests: [{ type: Types.ObjectId, ref: "SubCategory" }],
  },
  { timestamps: true }
);

module.exports = model("User", userSchema);
