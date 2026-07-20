import { Schema, model, Types } from "mongoose";
import "./PlaceCategory.schema";

export interface PlaceTimeSlotDocument {
  startTime: string;
  endTime: string;
}

export interface PlaceDayScheduleDocument {
  open: boolean;
  timeSlots: PlaceTimeSlotDocument[];
}

export interface PlaceDefaultScheduleDocument {
  monday: PlaceDayScheduleDocument;
  tuesday: PlaceDayScheduleDocument;
  wednesday: PlaceDayScheduleDocument;
  thursday: PlaceDayScheduleDocument;
  friday: PlaceDayScheduleDocument;
  saturday: PlaceDayScheduleDocument;
  sunday: PlaceDayScheduleDocument;
}

export interface PlaceCustomDateDocument {
  date: Date;
  open: boolean;
  timeSlots: PlaceTimeSlotDocument[];
}

export interface PlaceLocationDocument {
  type: "Point";
  coordinates: [number, number];
  label: string;
  id: string;
}

export interface PlaceDocumentProps {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  location: PlaceLocationDocument;
  placeCategory: Types.ObjectId;
  defaultSchedule: PlaceDefaultScheduleDocument;
  customDates: PlaceCustomDateDocument[];
  rating: number;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  deleteReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const timeSlotSchema = new Schema<PlaceTimeSlotDocument>(
  {
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },
  },
  { _id: false }
);

const defaultScheduleSchema = new Schema<PlaceDefaultScheduleDocument>(
  {
    monday: {
      open: { type: Boolean, required: true },
      timeSlots: { type: [timeSlotSchema], default: [] },
    },
    tuesday: {
      open: { type: Boolean, required: true },
      timeSlots: { type: [timeSlotSchema], default: [] },
    },
    wednesday: {
      open: { type: Boolean, required: true },
      timeSlots: { type: [timeSlotSchema], default: [] },
    },
    thursday: {
      open: { type: Boolean, required: true },
      timeSlots: { type: [timeSlotSchema], default: [] },
    },
    friday: {
      open: { type: Boolean, required: true },
      timeSlots: { type: [timeSlotSchema], default: [] },
    },
    saturday: {
      open: { type: Boolean, required: true },
      timeSlots: { type: [timeSlotSchema], default: [] },
    },
    sunday: {
      open: { type: Boolean, required: true },
      timeSlots: { type: [timeSlotSchema], default: [] },
    },
  },
  { _id: false }
);

export const customDateSchema = new Schema<PlaceCustomDateDocument>(
  {
    date: { type: Date, required: true },
    open: { type: Boolean, required: true },
    timeSlots: [timeSlotSchema],
  },
  { _id: false }
);

export const locationSchema = new Schema<PlaceLocationDocument>(
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

const placeSchema = new Schema<PlaceDocumentProps>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    location: locationSchema,
    placeCategory: {
      type: Schema.Types.ObjectId,
      ref: "PlaceCategory",
      required: true,
    },
    defaultSchedule: {
      type: defaultScheduleSchema,
      required: true,
      default: {},
    },
    customDates: [customDateSchema],
    rating: { type: Number, default: 0 },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deleteReason: { type: String },
  },
  { timestamps: true }
);

placeSchema.index({ "location.coordinates": "2dsphere" });

export default model<PlaceDocumentProps>("Place", placeSchema);
