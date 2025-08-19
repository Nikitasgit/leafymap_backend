import { IUser } from "./models/user";
import { Request } from "express";

export interface IDecodedToken {
  id: string;
  userType: string;
  iat: number;
  exp: number;
}
export interface CustomRequest extends Request {
  file?: Express.Multer.File & { location?: string };
  placeId?: string;
  decoded?: IDecodedToken;
}
