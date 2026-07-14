import { Schema, model, Types } from "mongoose";
import { ISO_COUNTRIES_ALPHA2 } from "@/utils/constants/countries";
import { IUser, IAddress } from "@/types/models/user";

const addressSchema = new Schema<IAddress>({
  number: { type: String },
  street: { type: String, required: true },
  code: { type: String, required: true },
  extra: { type: String },
});

const userPreferencesSchema = new Schema(
  {
    emailNotifications: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    firstname: { type: String },
    lastname: { type: String },
    username: { type: String },
    userCategory: { type: Types.ObjectId, ref: "UserCategory" },
    email: { type: String, required: true, unique: true },
    website: { type: String },
    phone: { type: String },
    password: { type: String, required: true },
    userType: {
      type: String,
      enum: ["creator", "guest"],
      required: true,
      default: "guest",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true,
      default: "user",
    },
    deleted: { type: Boolean, default: false },
    bannedAt: { type: Date },
    banReason: { type: String },
    banDuration: { type: Number },
    banExpiresAt: { type: Date },
    lastLogin: { type: Date },
    address: addressSchema,
    description: { type: String, maxlength: 300 },
    country: { type: String, enum: ISO_COUNTRIES_ALPHA2 },
    image: { type: Types.ObjectId, ref: "Image" },
    followers: { type: Number, default: 0 },
    interests: [{ type: Types.ObjectId, ref: "UserCategory" }],
    place: { type: Types.ObjectId, ref: "Place" },
    acceptedCGU: { type: Boolean, required: true, default: false },
    acceptedAt: { type: Date, required: true },
    emailVerified: { type: Boolean, default: true },
    emailVerificationTokenHash: { type: String },
    emailVerificationExpiresAt: { type: Date },
    resetPasswordTokenHash: { type: String },
    resetPasswordExpiresAt: { type: Date },
    googleId: { type: String, sparse: true },
    googlePictureUrl: { type: String },
    preferences: { type: userPreferencesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
