import { Document, Types } from "mongoose";

// SubCategory-related interfaces
export interface ISubCategory extends Document {
  name: string;
  categoryId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
