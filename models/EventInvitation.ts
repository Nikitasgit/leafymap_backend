import mongoose from "mongoose";

const eventInvitationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
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

export const EventInvitation = mongoose.model(
  "EventInvitation",
  eventInvitationSchema
);
