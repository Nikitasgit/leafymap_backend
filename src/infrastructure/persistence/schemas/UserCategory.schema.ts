import { Schema, model, Types } from "mongoose";
import "./CategoryType.schema";

export interface UserCategoryDocumentProps {
  _id?: Types.ObjectId;
  name: string;
  type: Types.ObjectId;
}

const userCategorySchema = new Schema<UserCategoryDocumentProps>({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: Schema.Types.ObjectId,
    ref: "CategoryType",
    required: true,
  },
});

export default model<UserCategoryDocumentProps>(
  "UserCategory",
  userCategorySchema
);
