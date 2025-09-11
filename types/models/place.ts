import { Document, Types } from "mongoose";
import { IUser } from "./user";
import { IImage } from "./Image";

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

export type PlaceType = "food" | "art" | "craft";

export interface ILocation {
  type: "Point";
  coordinates: [number, number];
  label: string;
  id: string;
}

export interface IPlace extends Document {
  name: string;
  description?: string;
  user: Types.ObjectId | Pick<IUser, "description">;
  location: ILocation;
  phone?: string;
  email?: string;
  website?: string;
  image?: Types.ObjectId | Pick<IImage, "urls">;
  active: boolean;
  deleted: boolean;
  isCreatorPlace: boolean;
  rating: number;
  placeCategory: Types.ObjectId;
  placeType: PlaceType[];
  defaultSchedule: IDefaultSchedule;
  customDates: ICustomDate[];
  createdAt: Date;
  updatedAt: Date;
}
