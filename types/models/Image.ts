import { Document } from "mongoose";

export interface IImage extends Document {
  url: string;
  user: string;
  reference: string;
  referenceType: string;
  type: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface IImageAWS {
  originalName: string;
  url: string;
  signedUrl: string;
  size: number;
  mimetype: string;
}
