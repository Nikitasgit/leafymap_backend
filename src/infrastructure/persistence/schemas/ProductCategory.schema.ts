import { Schema, model, Types } from "mongoose";
import "./CategoryType.schema";

export interface ProductCategoryDocumentProps {
  _id?: Types.ObjectId;
  name: string;
  type: Types.ObjectId;
}

const productCategorySchema = new Schema<ProductCategoryDocumentProps>({
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

export const ProductCategoryModel = model<ProductCategoryDocumentProps>(
  "ProductCategory",
  productCategorySchema
);

export default ProductCategoryModel;
