import { Document, Types } from "mongoose";
import { ICollaborator } from "./collaborator";

export interface IEventTimeSlot {
  title: string;
  startTime: string;
  endTime: string;
  collaborators: ICollaborator[];
}

export interface IEventPeriod {
  startDate: Date;
  endDate: Date;
  timeSlots: IEventTimeSlot[];
}

export interface IEvent extends Document {
  name: string;
  collaborators: ICollaborator[];
  description: string;
  schedule: IEventPeriod[];
  place: Types.ObjectId;
  image?: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}
