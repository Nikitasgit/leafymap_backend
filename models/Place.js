const mongoose = require("mongoose");
const { Schema } = mongoose;

const timeSlotSchema = new Schema(
  {
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const defaultScheduleSchema = new Schema(
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

const customScheduleSchema = new Schema(
  {
    date: { type: Date, required: true },
    open: { type: Boolean, required: true },
    timeSlots: [timeSlotSchema],
  },
  { _id: false }
);

const collaboratorSchema = new Schema(
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

const createdCollaboratorSchema = new Schema({
  name: { type: String },
  category: { type: Schema.Types.ObjectId, ref: "SubCategory" },
});

const locationSchema = new Schema(
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

const placeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  location: locationSchema,
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  placeImg: { type: String },
  active: { type: Boolean },
  deleted: { type: Boolean, default: false },
  isCreatorPlace: { type: Boolean, required: true },
  placeCategory: {
    type: Schema.Types.ObjectId,
    ref: "PlaceCategory",
  },
  defaultSchedule: { type: defaultScheduleSchema, required: true },
  customSchedule: [customScheduleSchema],
  collaborators: [collaboratorSchema],
  createdCollaborators: [createdCollaboratorSchema],
  categories: {
    type: [{ type: Schema.Types.ObjectId, ref: "SubCategory" }],
  },
});

// Optional: Add 2dsphere index for geo queries
placeSchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model("Place", placeSchema);
