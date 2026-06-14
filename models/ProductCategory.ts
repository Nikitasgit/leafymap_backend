import { Schema, model } from "mongoose";
import "../models/CategoryType";
import { IProductCategory } from "@/types/models/productCategory";

const productCategorySchema = new Schema<IProductCategory>({
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

export default model<IProductCategory>(
  "ProductCategory",
  productCategorySchema
);
