import { Document, Types } from "mongoose";

export type FavoriteReferenceType = "Place";

export interface IFavorite extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  reference: Types.ObjectId;
  referenceType: FavoriteReferenceType;
  createdAt: Date;
  updatedAt: Date;
}
