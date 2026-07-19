import { Schema, model, Types } from "mongoose";
import "./CategoryType.schema";

export interface PlaceCategoryDocumentProps {
  _id?: Types.ObjectId;
  name: string;
  types: Types.ObjectId[];
}

const placeCategorySchema = new Schema<PlaceCategoryDocumentProps>({
  name: {
    type: String,
    required: true,
  },
  types: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "CategoryType",
      },
    ],
    required: true,
  },
});

export const PlaceCategoryModel = model<PlaceCategoryDocumentProps>(
  "PlaceCategory",
  placeCategorySchema
);

export default PlaceCategoryModel;
