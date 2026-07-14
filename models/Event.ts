import { model, Schema, UpdateQuery } from "mongoose";
import { IEventTimeSlot, IEventPeriod, IEvent } from "@/types/models/event";
import "../models/EventCategory";
import EventStatusService from "@/services/eventStatusService";
import { locationSchema } from "./Place";

const eventStatusService = new EventStatusService();

export const eventTimeSlotSchema = new Schema<IEventTimeSlot>({
  title: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  collaborators: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

export const customScheduleWithParticipantsSchema = new Schema<IEventPeriod>({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timeSlots: [eventTimeSlotSchema],
});

export const eventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    schedule: {
      type: [customScheduleWithParticipantsSchema],
      required: [true, "Please add a schedule"],
    },
    eventCategory: {
      type: Schema.Types.ObjectId,
      ref: "EventCategory",
      required: [true, "Please add an event category"],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Please add a user"],
    },
    place: {
      type: Schema.Types.ObjectId,
      ref: "Place",
      required: false,
      default: null,
    },
    location: {
      type: locationSchema,
      required: false,
      default: null,
    },
    online: { type: Boolean, default: false },
    image: {
      type: Schema.Types.ObjectId,
      ref: "Image",
      required: false,
    },
    status: {
      type: String,
      enum: ["cancelled", "full", "available"],
      default: "available",
    },
    lifecycleStatus: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "unvalid"],
      default: "unvalid",
    },
    dateRange: {
      firstDate: { type: Date, required: false },
      latestDate: { type: Date, required: false },
    },
    rating: { type: Number, default: 0 },
    isBookable: { type: Boolean, default: false },
    capacity: { type: Number, default: null, min: 1 },
    maxSeatsPerBooking: { type: Number, default: 1, min: 1 },
    deleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deleteReason: { type: String },
  },
  { timestamps: true }
);

eventSchema.pre("validate", function (next) {
  if (this.online) {
    this.place = null;
    this.location = null;
    return next();
  }

  if (!this.place && !this.location) {
    return next(new Error("Please add a place or a location"));
  }

  next();
});

eventSchema.pre("validate", function (next) {
  if (!this.isBookable) {
    return next();
  }

  if (typeof this.capacity === "number" && this.capacity < this.maxSeatsPerBooking) {
    return next(
      new Error(
        "Le nombre de places réservables par utilisateur ne peut pas dépasser la capacité totale"
      )
    );
  }

  next();
});

eventSchema.index({ "location.coordinates": "2dsphere" });

eventSchema.pre("save", function (next) {
  if (this.isModified("schedule") || this.isNew) {
    if (this.schedule && this.schedule.length > 0) {
      const { dateRange, lifecycleStatus } =
        eventStatusService.calculateEventStatus(this.schedule);
      this.dateRange = dateRange;
      this.lifecycleStatus = lifecycleStatus;
    }
  }
  next();
});

eventSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as UpdateQuery<IEvent> | null;
  if (update && update.schedule) {
    const { dateRange, lifecycleStatus } =
      eventStatusService.calculateEventStatus(update.schedule);
    if (update.$set) {
      update.$set.dateRange = dateRange;
      update.$set.lifecycleStatus = lifecycleStatus;
    } else {
      update.dateRange = dateRange;
      update.lifecycleStatus = lifecycleStatus;
    }
  }
  next();
});

export default model<IEvent>("Event", eventSchema);
