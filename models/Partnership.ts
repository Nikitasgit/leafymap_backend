import mongoose from "mongoose";

const partnershipSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  events: { type: [mongoose.Schema.Types.ObjectId], ref: "Event", default: [] },
  status: {
    type: String,
    enum: ["pending", "accepted", "refused", "cancelled", "completed"],
    required: true,
    default: "pending",
  },
  deleted: { type: Boolean, default: false },
});

export const Partnership = mongoose.model("Partnership", partnershipSchema);
