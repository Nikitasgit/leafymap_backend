import { Request } from "express";
import { ImageDTO } from "./api/image.dto";
import { IReview } from "./models/review";
import { IComment } from "./models/comment";
import { IMessage } from "./models/message";
import { IImage } from "./models/Image";
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
  review?: IReview;
  comment?: IComment;
  message?: IMessage;
  conversation?: IConversation;
  reviewReferenceIsOwner?: boolean;
  reviewReference?: IPlace | IEvent | null;
  commentReference?: IImage | IReview | null;
  imageReferenceIsOwner?: boolean;
  imageReference?: IPlace | IEvent | null;
}
