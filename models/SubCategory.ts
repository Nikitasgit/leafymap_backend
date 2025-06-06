import mongoose, { Schema, model, Types, Document } from "mongoose";

export interface ISubCategory extends Document {
  name: string;
  categoryId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subcategorySchema = new Schema<ISubCategory>({
  name: {
    type: String,
    required: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});

export default model<ISubCategory>("SubCategory", subcategorySchema);
