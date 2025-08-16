import { Document, Types } from "mongoose";
import { IPlace } from "./place";

export interface IEventTimeSlot {
  _id: Types.ObjectId;
  title: string;
  startTime: string;
  endTime: string;
  collaborators: Types.ObjectId[];
}

export interface IEventPeriod {
  startDate: Date;
  endDate: Date;
  timeSlots: IEventTimeSlot[];
}

export interface IEvent extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  schedule: IEventPeriod[];
  place: Types.ObjectId | Partial<IPlace>;
  image?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}
