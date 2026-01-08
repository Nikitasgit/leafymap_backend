import { model, Schema } from "mongoose";
import { IEventTimeSlot, IEventPeriod, IEvent } from "../types/models/event";
import EventStatusService from "../services/eventStatusService";

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
    place: {
      type: Schema.Types.ObjectId,
      ref: "Place",
      required: [true, "Please add a place"],
    },
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
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

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
  const update = this.getUpdate() as any;
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
