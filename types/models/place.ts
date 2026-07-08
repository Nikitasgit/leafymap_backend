import { Document, Types } from "mongoose";
import { IUser } from "./user";
import { IImage } from "./Image";
import { ICategoryType } from "./categoryType";

export interface IPlaceTimeSlot {
  startTime: string;
  endTime: string;
}
export interface IDaySchedule {
  open: boolean;
  timeSlots: IPlaceTimeSlot[];
}

export interface IDefaultSchedule {
  monday: IDaySchedule;
  tuesday: IDaySchedule;
  wednesday: IDaySchedule;
  thursday: IDaySchedule;
  friday: IDaySchedule;
  saturday: IDaySchedule;
  sunday: IDaySchedule;
}

export interface ICustomDate {
  date: Date;
  open: boolean;
  timeSlots: IPlaceTimeSlot[];
}

export interface ILocation {
  type: "Point";
  coordinates: [number, number];
  label: string;
  id: string;
}

export interface IPlace extends Document {
  user: Types.ObjectId | Pick<IUser, "description">;
  location: ILocation;
  placeCategory: Types.ObjectId;
  placeType: Types.ObjectId[] | Partial<ICategoryType>[];
  defaultSchedule: IDefaultSchedule;
  customDates: ICustomDate[];
  rating: number;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  deleteReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
