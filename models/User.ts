import mongoose, { Schema, model, Types, Document } from "mongoose";
import { ISO_COUNTRIES_ALPHA2 } from "../utils/constants/countries";

// Interfaces
interface ILocation {
  number?: string;
  street: string;
  code: string;
  extra?: string;
}

interface ICreatorProfile {
  categories: Types.ObjectId[];
  place?: Types.ObjectId;
  name: string;
}

export interface IUser extends Document {
  firstname?: string;
  lastname?: string;
  username: string;
  email: string;
  website?: string;
  phone?: string;
  password: string;
  userType: "creator" | "organizer" | "guest";
  deleted: boolean;
  location?: ILocation;
  description?: string;
  country?: (typeof ISO_COUNTRIES_ALPHA2)[number];
  image?: string;
  followers: Types.ObjectId[];
  creatorProfile?: ICreatorProfile;
  interests: Types.ObjectId[];
  places: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const locationSchema = new Schema<ILocation>({
  number: { type: String },
  street: { type: String, required: true },
  code: { type: String, required: true },
  extra: { type: String },
});

const creatorProfileSchema = new Schema<ICreatorProfile>({
  categories: [{ type: Types.ObjectId, ref: "SubCategory" }],
  place: { type: Types.ObjectId, ref: "Place" },
  name: { type: String, required: true },
});

const userSchema = new Schema<IUser>(
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

export default model<IUser>("User", userSchema);
