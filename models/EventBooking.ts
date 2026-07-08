import mongoose from "mongoose";

const eventBookingSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      required: true,
      default: "confirmed",
    },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const EventBooking = mongoose.model(
  "EventBooking",
  eventBookingSchema
);
