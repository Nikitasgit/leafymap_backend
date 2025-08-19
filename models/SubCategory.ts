import { Schema, model, Types, Document } from "mongoose";
import "../models/Category"; 
export interface ISubCategory extends Document {
  name: string;
  category: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subcategorySchema = new Schema<ISubCategory>({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
});

export default model<ISubCategory>("SubCategory", subcategorySchema);
