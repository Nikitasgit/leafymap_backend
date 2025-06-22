import mongoose, { Schema, model, Document } from "mongoose";

type PlaceType = "art" | "craft" | "food";
export interface IPlaceCategory extends Document {
  name: string;
  description: string;
  types: PlaceType[];
  createdAt: Date;
  updatedAt: Date;
}

const placeCategorySchema = new Schema<IPlaceCategory>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  types: {
    type: [String],
    required: true,
  },
});

export default model<IPlaceCategory>("PlaceCategory", placeCategorySchema);
