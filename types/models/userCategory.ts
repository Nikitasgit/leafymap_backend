import { Document, Types } from "mongoose";

export interface IUserCategory extends Document {
  name: string;
  category: Types.ObjectId;
  userCategoryType: "creation" | "organization";
  createdAt: Date;
  updatedAt: Date;
}

