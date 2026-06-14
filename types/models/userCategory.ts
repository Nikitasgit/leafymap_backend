import { Document, Types } from "mongoose";

export interface IUserCategory extends Document {
  name: string;
  type: Types.ObjectId;
}
