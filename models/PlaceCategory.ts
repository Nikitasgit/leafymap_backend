import { Schema, model } from "mongoose";
import "../models/CategoryType";
import { IPlaceCategory } from "@/types/models/placeCategory";

const placeCategorySchema = new Schema<IPlaceCategory>({
  name: {
    type: String,
    required: true,
  },
  types: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "CategoryType",
      },
    ],
    required: true,
  },
});

export default model<IPlaceCategory>("PlaceCategory", placeCategorySchema);
