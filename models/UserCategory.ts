import { Schema, model } from "mongoose";
import "../models/Category";
import { IUserCategory } from "@/types/models/userCategory";

const userCategorySchema = new Schema<IUserCategory>(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    userCategoryType: {
      type: String,
      enum: ["creation", "organization"],
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IUserCategory>("UserCategory", userCategorySchema);
