import { Schema, model } from "mongoose";
import { ICategoryType } from "@/types/models/categoryType";

const categoryTypeSchema = new Schema<ICategoryType>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

export default model<ICategoryType>("CategoryType", categoryTypeSchema);
