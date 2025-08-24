import { IUser } from "./models/user";
import { Request } from "express";

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
}
