import { Schema, model, Types } from "mongoose";
import { ISO_COUNTRIES_ALPHA2 } from "../utils/constants/countries";
import { ICreatorProfile, IUser, IAddress } from "../types/models/user";

const addressSchema = new Schema<IAddress>({
  number: { type: String },
  street: { type: String, required: true },
  code: { type: String, required: true },
  extra: { type: String },
});


const userSchema = new Schema<IUser>(
  {
    firstname: { type: String },
    lastname: { type: String },
    username: { type: String, required: true, unique: true },
    creatorName: { type: String },
    creatorCategories: [{ type: Types.ObjectId, ref: "SubCategory" }],
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
    country: { type: String, enum: ISO_COUNTRIES_ALPHA2 },
    image: { type: Types.ObjectId, ref: "Image" },
    followers: [{ type: Types.ObjectId, ref: "User" }],
    interests: [{ type: Types.ObjectId, ref: "SubCategory" }],
    places: [{ type: Types.ObjectId, ref: "Place" }],
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
