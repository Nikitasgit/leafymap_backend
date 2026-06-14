import { Document, Types } from "mongoose";

export interface IPlaceCategory extends Document {
  name: string;
  types: Types.ObjectId[];
}
