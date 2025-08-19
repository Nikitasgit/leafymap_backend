import { Document, Types } from "mongoose";

// SubCategory-related interfaces
export interface ISubCategory extends Document {
  name: string;
  category: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
