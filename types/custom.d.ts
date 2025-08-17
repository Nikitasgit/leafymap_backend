import { IUser } from "./models/user";
import { Request } from "express";
import { IDecodedToken } from "middlewares/auth";

export interface CustomRequest extends Request {
  file?: Express.Multer.File & { location?: string };
  placeId?: string;
  decoded?: IDecodedToken;
}
