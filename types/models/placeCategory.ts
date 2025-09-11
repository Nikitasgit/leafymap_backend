import { Document } from "mongoose";

export type CategoryPlaceType = "art" | "craft" | "food";

export interface IPlaceCategory extends Document {
  name: string;
  description: string;
  types: CategoryPlaceType[];
  createdAt: Date;
  updatedAt: Date;
}
