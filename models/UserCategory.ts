import { Schema, model } from "mongoose";
import "../models/CategoryType";
import { IUserCategory } from "@/types/models/userCategory";

const userCategorySchema = new Schema<IUserCategory>({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: Schema.Types.ObjectId,
    ref: "CategoryType",
    required: true,
  },
});

export default model<IUserCategory>("UserCategory", userCategorySchema);
