import { Document, Types } from "mongoose";
import { IPlace } from "./place";
import { IImage } from "./Image";

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
  timeSlots?: IEventTimeSlot[];
}

export interface IEvent extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  status: "cancelled" | "full" | "available";
  schedule: IEventPeriod[];
  place: Types.ObjectId | Partial<IPlace>;
  image?: Types.ObjectId | Partial<IImage>;
  rating: number;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
