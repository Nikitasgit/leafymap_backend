import { IUser } from "../models/User";
import { Request } from "express";

export interface CustomRequest extends Request {
  user?: IUser;
  file?: Express.Multer.File & { location?: string };
}
