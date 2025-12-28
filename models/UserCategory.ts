import { Schema, model, Types, Document } from "mongoose";
import "../models/Category";

export interface IUserCategory extends Document {
  name: string;
  category: Types.ObjectId;
  userCategoryType: "creation" | "organization";
  createdAt: Date;
  updatedAt: Date;
}

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
