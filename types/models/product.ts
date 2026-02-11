import { Document, Types } from "mongoose";

export interface IProduct extends Document {
  productCategory: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
