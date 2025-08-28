import { Request } from "express";
import { ImageDTO } from "./api/image.dto";

export interface IDecodedToken {
  id: string;
  userType: string;
  iat: number;
  exp: number;
}
export interface CustomRequest extends Request {
  files?: S3File[] | { [fieldname: string]: S3File[] };
  placeId?: string;
  decoded?: IDecodedToken;
  images?: string[];
}
