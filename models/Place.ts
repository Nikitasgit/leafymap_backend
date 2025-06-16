import mongoose, { Schema, model, Types, Document } from "mongoose";

// Interfaces
export interface ITimeSlot {
  startTime: string;
  endTime: string;
}

interface IDaySchedule {
  open: boolean;
  timeSlots: ITimeSlot[];
}

interface IDefaultSchedule {
  monday: IDaySchedule;
  tuesday: IDaySchedule;
  wednesday: IDaySchedule;
  thursday: IDaySchedule;
  friday: IDaySchedule;
  saturday: IDaySchedule;
  sunday: IDaySchedule;
}

export interface ICustomSchedule {
  date: Date;
  open: boolean;
  timeSlots: ITimeSlot[];
}

interface ICollaborator {
  userId: Types.ObjectId;
  status: "pending" | "accepted" | "refused";
}

export interface ICreatedCollaborator {
  name?: string;
  category?: Types.ObjectId;
}

interface ILocation {
  type: "Point";
  coordinates: [number, number];
  label: string;
  id: string;
}

export interface IPlace extends Document {
  name: string;
  description?: string;
  userId: Types.ObjectId;
  location: ILocation;
  phone?: string;
  email?: string;
  website?: string;
  image?: string;
  active: boolean;
  deleted: boolean;
  isCreatorPlace: boolean;
  rating: number;
  placeCategory: Types.ObjectId;
  defaultSchedule: IDefaultSchedule;
  customSchedule: ICustomSchedule[];
  collaborators: ICollaborator[];
  createdCollaborators: ICreatedCollaborator[];
  categories: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Schemas
const timeSlotSchema = new Schema<ITimeSlot>(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const defaultScheduleSchema = new Schema<IDefaultSchedule>(
  {
    monday: {
      open: { type: Boolean, required: true },
      timeSlots: { type: [timeSlotSchema], required: true },
    },
    tuesday: {
      open: { type: Boolean, required: true },
      timeSlots: { type: [timeSlotSchema], required: true },
    },
    wednesday: {
      open: { type: Boolean, required: true },
      timeSlots: { type: [timeSlotSchema], required: true },
    },
    thursday: {
      open: { type: Boolean, required: true },
      timeSlots: { type: [timeSlotSchema], required: true },
    },
    friday: {
      open: { type: Boolean, required: true },
      timeSlots: { type: [timeSlotSchema], required: true },
    },
    saturday: {
      open: { type: Boolean, required: true },
      timeSlots: { type: [timeSlotSchema], required: true },
    },
    sunday: {
      open: { type: Boolean, required: true },
      timeSlots: { type: [timeSlotSchema], required: true },
    },
  },
  { _id: false }
);

export const customScheduleSchema = new Schema<ICustomSchedule>(
  {
    date: { type: Date, required: true },
    open: { type: Boolean, required: true },
    timeSlots: [timeSlotSchema],
  },
  { _id: false }
);

const collaboratorSchema = new Schema<ICollaborator>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "refused"],
      required: true,
      default: "pending",
    },
  },
  { _id: false }
);

export const createdCollaboratorSchema = new Schema<ICreatedCollaborator>({
  name: { type: String },
  category: { type: Schema.Types.ObjectId, ref: "SubCategory" },
});

const locationSchema = new Schema<ILocation>(
  {
    type: { type: String, enum: ["Point"], required: true },
    coordinates: {
      type: [Number],
      required: true,
      index: "2dsphere",
    },
    label: { type: String, required: true },
    id: { type: String, required: true },
  },
  { _id: false }
);

const placeSchema = new Schema<IPlace>({
  name: { type: String, required: true },
  description: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  location: locationSchema,
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  image: { type: String },
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  isCreatorPlace: { type: Boolean, required: true },
  rating: { type: Number, default: 0 },
  placeCategory: {
    type: Schema.Types.ObjectId,
    ref: "PlaceCategory",
    required: true,
  },
  defaultSchedule: { type: defaultScheduleSchema, required: true },
  customSchedule: [customScheduleSchema],
  collaborators: [collaboratorSchema],
  createdCollaborators: [createdCollaboratorSchema],
  categories: {
    type: [{ type: Schema.Types.ObjectId, ref: "SubCategory" }],
  },
});

// Add 2dsphere index for geo queries
placeSchema.index({ "location.coordinates": "2dsphere" });

export default model<IPlace>("Place", placeSchema);
