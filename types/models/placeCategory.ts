import { Document } from "mongoose";

// PlaceCategory-related interfaces
export type PlaceType = "art" | "craft" | "food";

export interface IPlaceCategory extends Document {
  name: string;
  description: string;
  types: PlaceType[];
  createdAt: Date;
  updatedAt: Date;
}
