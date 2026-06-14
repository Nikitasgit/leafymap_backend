import { Document, Types } from "mongoose";

export interface IProductCategory extends Document {
  name: string;
  type: Types.ObjectId;
}
