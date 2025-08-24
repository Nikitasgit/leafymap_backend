import { Document, Types } from "mongoose";
import { ISO_COUNTRIES_ALPHA2 } from "../../utils/constants/countries";
import { IPlace } from "./place";

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
  username: string;
  creatorName?: string;
  creatorCategories?: Types.ObjectId[];
  email: string;
  website?: string;
  phone?: string;
  password: string;
  userType: "creator" | "organizer" | "guest";
  deleted: boolean;
  address?: IAddress;
  description?: string;
  country?: (typeof ISO_COUNTRIES_ALPHA2)[number];
  image?: string;
  followers: Types.ObjectId[];
  creatorProfile?: ICreatorProfile;
  interests: Types.ObjectId[];
  places: (Types.ObjectId | IPlace)[];
  createdAt: Date;
  updatedAt: Date;
}
