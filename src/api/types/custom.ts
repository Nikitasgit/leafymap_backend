import { Request } from "express";
import { JwtTokenPayload } from "@src/domain/interfaces/IJwtTokenIssuer";

export type IDecodedToken = JwtTokenPayload;

export interface CustomRequest extends Request {
  decoded?: IDecodedToken;
}
