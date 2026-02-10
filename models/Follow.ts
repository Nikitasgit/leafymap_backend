import { Schema, model } from "mongoose";
import { IFollow } from "@/types/models/follow";

const followSchema = new Schema<IFollow>(
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

export default model<IFollow>("Follow", followSchema);
