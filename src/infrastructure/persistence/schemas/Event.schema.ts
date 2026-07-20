import { Schema, model, Types, UpdateQuery } from "mongoose";
import { locationSchema } from "@src/infrastructure/persistence/schemas/Place.schema";
import "./EventCategory.schema";
import {
  EVENT_STATUSES,
  EventStatus,
} from "@src/domain/value-objects/EventStatus.vo";
import {
  LIFECYCLE_STATUSES,
  LifecycleStatus,
} from "@src/domain/value-objects/LifecycleStatus.vo";
import {
  EventDateRange,
  EventPeriod,
  calculateEventStatus,
} from "@src/domain/value-objects/EventSchedule.vo";
import { EventLocation } from "@src/domain/entities/Event.entity";

export interface EventTimeSlotDocument {
  _id?: Types.ObjectId;
  title: string;
  startTime: string;
  endTime: string;
  collaborators: Types.ObjectId[];
}

export interface EventPeriodDocument {
  startDate: Date;
  endDate: Date;
  timeSlots?: EventTimeSlotDocument[];
}

export interface EventDocumentProps {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  schedule: EventPeriodDocument[];
  eventCategory: Types.ObjectId;
  user: Types.ObjectId;
  place?: Types.ObjectId | null;
  location?: EventLocation | null;
  online: boolean;
  image?: Types.ObjectId;
  status: EventStatus;
  lifecycleStatus: LifecycleStatus;
  dateRange: EventDateRange;
  rating: number;
  isBookable: boolean;
  capacity?: number | null;
  maxSeatsPerBooking: number;
  deleted: boolean;
  deletedAt?: Date;
  deletedBy?: Types.ObjectId;
  deleteReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const eventTimeSlotSchema = new Schema<EventTimeSlotDocument>({
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

const eventPeriodSchema = new Schema<EventPeriodDocument>({
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  timeSlots: [eventTimeSlotSchema],
});

const eventSchema = new Schema<EventDocumentProps>(
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
      type: [eventPeriodSchema],
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
      enum: [...EVENT_STATUSES],
      default: "available",
    },
    lifecycleStatus: {
      type: String,
      enum: [...LIFECYCLE_STATUSES],
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

eventSchema.index({ "location.coordinates": "2dsphere" });

/** Safety net for schedule updates that bypass the domain entity. */
eventSchema.pre("save", function (next) {
  if (this.isModified("schedule") || this.isNew) {
    if (this.schedule && this.schedule.length > 0) {
      const { dateRange, lifecycleStatus } = calculateEventStatus(
        this.schedule as EventPeriod[]
      );
      this.dateRange = dateRange;
      this.lifecycleStatus = lifecycleStatus;
    }
  }
  next();
});

eventSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as UpdateQuery<EventDocumentProps> | null;
  if (update && update.schedule) {
    const { dateRange, lifecycleStatus } = calculateEventStatus(
      update.schedule as EventPeriod[]
    );
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

export default model<EventDocumentProps>("Event", eventSchema);
