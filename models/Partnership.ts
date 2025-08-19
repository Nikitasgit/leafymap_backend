import mongoose from "mongoose";

const partnershipSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
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
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: false,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "refused", "cancelled", "completed"],
    required: true,
    default: "pending",
  },
  type: {
    type: String,
    enum: ["place", "event"],
    required: true,
    default: "place",
  },

  deleted: { type: Boolean, default: false },
});

export const Partnership = mongoose.model("Partnership", partnershipSchema);
