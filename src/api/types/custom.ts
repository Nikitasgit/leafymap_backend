import { Request } from "express";

export interface IDecodedToken {
  id: string;
  userType: string;
  role?: string;
  iat: number;
  exp: number;
}

export interface CustomRequest extends Request {
  decoded?: IDecodedToken;
}
