import { Schema, model, Types } from "mongoose";

export interface CategoryTypeDocumentProps {
  _id?: Types.ObjectId;
  name: string;
}

const categoryTypeSchema = new Schema<CategoryTypeDocumentProps>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
});

export default model<CategoryTypeDocumentProps>(
  "CategoryType",
  categoryTypeSchema
);
