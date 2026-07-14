import { Schema, model, Types } from "mongoose";
import { FavoriteReferenceType } from "@src/domain/value-objects/FavoriteReferenceType.vo";

export interface FavoriteDocumentProps {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  reference: Types.ObjectId;
  referenceType: FavoriteReferenceType;
  createdAt?: Date;
  updatedAt?: Date;
}

const favoriteSchema = new Schema<FavoriteDocumentProps>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reference: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "referenceType",
    },
    referenceType: {
      type: String,
      required: true,
      enum: ["Place"] as FavoriteReferenceType[],
    },
  },
  { timestamps: true }
);

favoriteSchema.index(
  { user: 1, reference: 1, referenceType: 1 },
  { unique: true }
);
favoriteSchema.index({ user: 1, referenceType: 1 });

export const FavoriteModel = model<FavoriteDocumentProps>(
  "Favorite",
  favoriteSchema
);

export default FavoriteModel;
