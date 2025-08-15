import { model, Schema } from "mongoose";
import { collaboratorSchema } from "./Place";
import { IEventTimeSlot, IEventPeriod, IEvent } from "../types/models/event";

export const eventTimeSlotSchema = new Schema<IEventTimeSlot>({
  title: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  collaborators: [collaboratorSchema],
});

export const customScheduleWithParticipantsSchema = new Schema<IEventPeriod>({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timeSlots: [eventTimeSlotSchema],
});

export const eventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    schedule: {
      type: [customScheduleWithParticipantsSchema],
      required: [true, "Please add a schedule"],
    },
    place: {
      type: Schema.Types.ObjectId,
      ref: "Place",
      required: [true, "Please add a place"],
    },
    image: String,
    collaborators: [collaboratorSchema],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

export default model<IEvent>("Event", eventSchema);
