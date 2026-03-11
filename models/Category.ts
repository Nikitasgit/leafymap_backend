import { Schema, model } from "mongoose";
import { ICategory } from "@/types/models/category";

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

export default model<ICategory>("Category", categorySchema);
