import { Schema, Types } from "mongoose";

const mongoose = require("mongoose");

export interface ITimeSlotWithParticipants {
  startTime: string;
  endTime: string;
  participants: Types.ObjectId[];
}

export const timeSlotWithParticipantsSchema =
  new Schema<ITimeSlotWithParticipants>(
    {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      participants: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    { _id: false }
  );

export interface ICustomScheduleWithParticipants {
  date: Date;
  open: boolean;
  timeSlots: ITimeSlotWithParticipants[];
}

export const customScheduleWithParticipantsSchema =
  new Schema<ICustomScheduleWithParticipants>(
    {
      date: { type: Date, required: true },
      open: { type: Boolean, required: true },
      timeSlots: [timeSlotWithParticipantsSchema],
    },
    { _id: false }
  );

export interface IEvent extends Document {
  title: string;
  collaborators: Types.ObjectId[];
  description: string;
  schedule: ICustomScheduleWithParticipants[];
  image: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
}

export const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    collaborators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    schedule: {
      type: [customScheduleWithParticipantsSchema],
      required: [true, "Please add a schedule"],
    },
    image: String,
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);
