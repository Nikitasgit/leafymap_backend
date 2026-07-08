import { Document, Types } from "mongoose";
import { ILocation, IPlace } from "./place";
import { IImage } from "./Image";
import { IUser } from "./user";
import { IEventCategory } from "./eventCategory";

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

export interface IEventDateRange {
  firstDate: Date;
  latestDate: Date;
}

export interface IEvent extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  status: "cancelled" | "full" | "available";
  lifecycleStatus: "upcoming" | "ongoing" | "completed" | "unvalid";
  schedule: IEventPeriod[];
  dateRange: IEventDateRange;
  eventCategory: Types.ObjectId | Partial<IEventCategory>;
  user: Types.ObjectId | Partial<IUser>;
  place?: Types.ObjectId | Partial<IPlace> | null;
  location?: ILocation | null;
  online: boolean;
  image?: Types.ObjectId | Partial<IImage>;
  rating: number;
  isBookable: boolean;
  capacity?: number | null;
  maxSeatsPerBooking: number;
  bookedSeats?: number;
  remainingSeats?: number | null;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  deleteReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
