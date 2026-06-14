import { Document } from "mongoose";

export interface IEventCategory extends Document {
  name: string;
}
