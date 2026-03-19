import { Schema, model } from "mongoose";
import { IFavorite, FavoriteReferenceType } from "@/types/models/favorite";

const favoriteSchema = new Schema<IFavorite>(
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

export default model<IFavorite>("Favorite", favoriteSchema);
