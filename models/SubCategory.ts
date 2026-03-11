import { Schema, model } from "mongoose";
import "../models/Category";
import { ISubCategory } from "@/types/models/subCategory";

const subcategorySchema = new Schema<ISubCategory>({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});

export default model<ISubCategory>("SubCategory", subcategorySchema);
