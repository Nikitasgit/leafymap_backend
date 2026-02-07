import mongoose from "mongoose";

const partnershipSchema = new mongoose.Schema(
  {
    initiator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "refused", "cancelled", "completed"],
      required: true,
      default: "pending",
    },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Partnership = mongoose.model("Partnership", partnershipSchema);
