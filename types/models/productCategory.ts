import { Document, Types } from "mongoose";

export interface IProductCategory extends Document {
  name: string;
  category: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
