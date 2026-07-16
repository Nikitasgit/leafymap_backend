import { Schema, model, Types } from "mongoose";

export interface FollowDocumentProps {
  _id?: Types.ObjectId;
  follower: Types.ObjectId;
  following: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const followSchema = new Schema<FollowDocumentProps>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

followSchema.index({ follower: 1, following: 1 }, { unique: true });
followSchema.index({ follower: 1 });
followSchema.index({ following: 1 });

export const FollowModel = model<FollowDocumentProps>("Follow", followSchema);

export default FollowModel;
