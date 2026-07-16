import { Request } from "express";
import { IMessage } from "./models/message";
import { IPlace, IEvent, IConversation } from "./models";

export interface IDecodedToken {
  id: string;
  userType: string;
  role?: string;
  iat: number;
  exp: number;
}

export interface CustomRequest extends Request {
  files?: S3File[] | { [fieldname: string]: S3File[] };
  placeId?: string;
  productId?: string;
  decoded?: IDecodedToken;
  images?: string[];
  message?: IMessage;
  conversation?: IConversation;
  imageReferenceIsOwner?: boolean;
  imageReference?: IPlace | IEvent | null;
}
