import { Schema, model } from "mongoose";
import { IPlaceCategory } from "@/types/models/placeCategory";

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
