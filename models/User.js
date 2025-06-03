import mongoose from "mongoose";
import { ISO_COUNTRIES_ALPHA2 } from "../utils/constants/countries.js";
const { Schema, model, Types } = mongoose;

const locationSchema = new Schema({
  number: { type: String },
  street: { type: String, required: true },
  code: { type: String, required: true },
  extra: { type: String },
});

const creatorProfileSchema = new Schema({
  categories: [{ type: Types.ObjectId, ref: "SubCategory" }],
  place: { type: Types.ObjectId, ref: "Place" },
  name: { type: String, required: true },
});

const userSchema = new Schema(
  {
    firstname: { type: String },
    lastname: { type: String },
    username: { type: String, required: true, unique: true },
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
    location: locationSchema,
    description: { type: String },
    country: { type: String, enum: ISO_COUNTRIES_ALPHA2 },
    image: { type: String },
    followers: [{ type: Types.ObjectId, ref: "User" }],
    creatorProfile: creatorProfileSchema,
    interests: [{ type: Types.ObjectId, ref: "SubCategory" }],
    places: [{ type: Types.ObjectId, ref: "Place" }],
  },
  { timestamps: true }
);

export default model("User", userSchema);
