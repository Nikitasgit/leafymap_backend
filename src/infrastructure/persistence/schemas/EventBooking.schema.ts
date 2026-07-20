import { Schema, model, Types } from "mongoose";
import {
  EVENT_BOOKING_STATUSES,
  EventBookingStatus,
} from "@src/domain/value-objects/EventBookingStatus.vo";

export interface EventBookingDocumentProps {
  _id?: Types.ObjectId;
  event: Types.ObjectId;
  user: Types.ObjectId;
  seats: number;
  status: EventBookingStatus;
  cancelledAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const eventBookingSchema = new Schema<EventBookingDocumentProps>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
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
      enum: [...EVENT_BOOKING_STATUSES],
      required: true,
      default: "confirmed",
    },
    cancelledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default model<EventBookingDocumentProps>(
  "EventBooking",
  eventBookingSchema
);
