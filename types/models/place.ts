import { Document, Types } from "mongoose";
import { ICollaborator } from "./collaborator";
import { IImage } from "./Image";
import { IUser } from "./user";

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
  image?: Types.ObjectId | Pick<IImage, "url">;
  active: boolean;
  deleted: boolean;
  isCreatorPlace: boolean;
  rating: number;
  placeCategory: Types.ObjectId;
  placeType: PlaceType[];
  defaultSchedule: IDefaultSchedule;
  customDates: ICustomDate[];
  collaborators: ICollaborator[];
  createdAt: Date;
  updatedAt: Date;
}
