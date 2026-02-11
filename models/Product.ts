import { Schema, model } from "mongoose";
import { IProduct } from "@/types/models/product";

const productSchema = new Schema<IProduct>(
  {
    productCategory: {
      type: Schema.Types.ObjectId,
      ref: "ProductCategory",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IProduct>("Product", productSchema);
