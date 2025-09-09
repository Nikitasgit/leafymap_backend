import { Document } from "mongoose";

export interface IImageUrls {
  original: string;
  thumbnail: string;
  medium: string;
}

export interface IImage extends Document {
  urls: IImageUrls;
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
  urls: IImageUrls;
  signedUrls: IImageUrls;
  size: number;
  mimetype: string;
}
