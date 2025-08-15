import { Schema, model } from "mongoose";
import {
  ICustomDate,
  IDefaultSchedule,
  ILocation,
  IPlace,
  IPlaceTimeSlot,
} from "../types/models/place";
import { ICollaborator } from "../types/models/collaborator";

const timeSlotSchema = new Schema<IPlaceTimeSlot>(
  {
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },
  },
  { _id: false }
);

const defaultScheduleSchema = new Schema<IDefaultSchedule>(
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

export const customDateSchema = new Schema<ICustomDate>(
  {
    date: { type: Date, required: true },
    open: { type: Boolean, required: true },
    timeSlots: [timeSlotSchema],
  },
  { _id: false }
);

export const collaboratorSchema = new Schema<ICollaborator>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "refused"],
      required: true,
      default: "pending",
    },
  },
  { _id: false }
);

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
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  location: locationSchema,
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  image: { type: String },
  images: [{ type: String }],
  active: { type: Boolean, default: true },
  deleted: { type: Boolean, default: false },
  isCreatorPlace: { type: Boolean, required: true, default: false },
  rating: { type: Number, default: 0 },
  placeCategory: {
    type: Schema.Types.ObjectId,
    ref: "PlaceCategory",
    required: true,
  },
  placeType: {
    type: [String],
    enum: ["food", "art", "craft"],
    required: true,
    default: ["art"],
  },
  defaultSchedule: { type: defaultScheduleSchema, required: true, default: {} },
  customDates: [customDateSchema],
  collaborators: [collaboratorSchema],
});

placeSchema.index({ "location.coordinates": "2dsphere" });

export default model<IPlace>("Place", placeSchema);
