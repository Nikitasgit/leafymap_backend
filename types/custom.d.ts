import { IUser } from "./models/user";
import { Request } from "express";

// Custom Express request interface with user and file properties
export interface CustomRequest extends Request {
  user?: IUser;
  file?: Express.Multer.File & { location?: string };
}
