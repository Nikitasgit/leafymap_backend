import { Document, Types } from "mongoose";
import { ISO_COUNTRIES_ALPHA2 } from "@/utils/constants/countries";
import { IPlace } from "./place";
import { IImage } from "./Image";
import { IUserCategory } from "./userCategory";

export interface IAddress {
  number?: string;
  street: string;
  code: string;
  extra?: string;
}

export interface ICreatorProfile {
  categories: Types.ObjectId[];
  place?: Types.ObjectId;
  name: string;
}

export interface IUser extends Document {
  firstname?: string;
  lastname?: string;
  username?: string;
  userCategory?: Types.ObjectId | IUserCategory;
  email: string;
  website?: string;
  phone?: string;
  password: string;
  userType: "creator" | "guest";
  deleted: boolean;
  address?: IAddress;
  description?: string;
  country?: (typeof ISO_COUNTRIES_ALPHA2)[number];
  image?: Types.ObjectId | Pick<IImage, "urls">;
  followers: number;
  creatorProfile?: ICreatorProfile;
  interests?: Types.ObjectId[] | IUserCategory[];
  place?: Types.ObjectId | IPlace;
  acceptedCGU: boolean;
  acceptedAt: Date;
  emailVerified?: boolean;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: Date;
  resetPasswordTokenHash?: string;
  resetPasswordExpiresAt?: Date;
  googleId?: string;
  googlePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
