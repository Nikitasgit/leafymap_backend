import { model, Schema, Types } from "mongoose";
import {
  createdCollaboratorSchema,
  ICreatedCollaborator,
  ICollaborator,
  collaboratorSchema,
} from "./Place";

export interface ITimeSlotWithParticipants {
  title: string;
  startTime: string;
  endTime: string;
  participants: Types.ObjectId[];
}

export const eventTimeSlotSchema = new Schema<ITimeSlotWithParticipants>(
  {
    title: { type: String, required: true },
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

export interface IEventPeriod {
  startDate: Date;
  endDate: Date;
  timeSlots: ITimeSlotWithParticipants[];
}

export const customScheduleWithParticipantsSchema = new Schema<IEventPeriod>(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timeSlots: [eventTimeSlotSchema],
  },
  { _id: false }
);

export interface IEvent extends Document {
  name: string;
  collaborators: ICollaborator[];
  createdCollaborators: ICreatedCollaborator[];
  description: string;
  schedule: IEventPeriod[];
  placeId: Types.ObjectId;
  image: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
}

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
    placeId: {
      type: Schema.Types.ObjectId,
      ref: "Place",
      required: [true, "Please add a place"],
    },
    image: String,
    collaborators: [collaboratorSchema],
    createdCollaborators: [createdCollaboratorSchema],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

export default model<IEvent>("Event", eventSchema);
