import { Schema, model } from "mongoose";
import { IProductCategory } from "@/types/models/productCategory";

const productCategorySchema = new Schema<IProductCategory>(
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
  },
  { timestamps: true }
);

export default model<IProductCategory>(
  "ProductCategory",
  productCategorySchema
);
