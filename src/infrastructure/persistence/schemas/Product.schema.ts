import { Schema, model, Types } from "mongoose";
import "./ProductCategory.schema";

export interface ProductDocumentProps {
  _id?: Types.ObjectId;
  productCategory: Types.ObjectId;
  user: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const productSchema = new Schema<ProductDocumentProps>(
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

export const ProductModel = model<ProductDocumentProps>(
  "Product",
  productSchema
);

export default ProductModel;
