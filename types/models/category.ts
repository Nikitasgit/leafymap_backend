import { Document } from "mongoose";

// Category-related interfaces
export interface ICategory extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}
