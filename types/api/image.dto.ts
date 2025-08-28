import { ObjectId } from "mongoose";

export interface ImageDTO {
  url: string;
  user: string | ObjectId;
  reference: string | ObjectId;
  referenceType: string;
  type: string;
  originalName: string;
  size: number;
  mimetype: string;
}
