import { Schema, model, Types } from "mongoose";
import { ISO_COUNTRIES_ALPHA2 } from "@src/shared/constants/countries";
import "./UserCategory.schema";

export interface UserAddressDocument {
  number?: string;
  street: string;
  code: string;
  extra?: string;
}

export interface UserPreferencesDocument {
  emailNotifications?: boolean;
}

export interface UserDocumentProps {
  _id?: Types.ObjectId;
  firstname?: string;
  lastname?: string;
  username?: string;
  userCategory?: Types.ObjectId;
  email: string;
  website?: string;
  phone?: string;
  password: string;
  userType: "creator" | "guest";
  role: "user" | "admin";
  deleted: boolean;
  bannedAt?: Date;
  banReason?: string;
  banDuration?: number;
  banExpiresAt?: Date;
  lastLogin?: Date;
  address?: UserAddressDocument;
  description?: string;
  country?: string;
  image?: Types.ObjectId;
  followers: number;
  interests?: Types.ObjectId[];
  place?: Types.ObjectId;
  acceptedCGU: boolean;
  acceptedAt: Date;
  emailVerified?: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: Date;
  resetPasswordTokenHash?: string;
  resetPasswordExpiresAt?: Date;
  googleId?: string;
  googlePictureUrl?: string;
  preferences?: UserPreferencesDocument;
  createdAt?: Date;
  updatedAt?: Date;
}

const addressSchema = new Schema<UserAddressDocument>({
  number: { type: String },
  street: { type: String, required: true },
  code: { type: String, required: true },
  extra: { type: String },
});

const userPreferencesSchema = new Schema<UserPreferencesDocument>(
  {
    emailNotifications: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema<UserDocumentProps>(
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

export const UserModel = model<UserDocumentProps>("User", userSchema);

export default UserModel;
