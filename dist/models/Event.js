"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventSchema = exports.customScheduleWithParticipantsSchema = exports.eventTimeSlotSchema = void 0;
const mongoose_1 = require("mongoose");
exports.eventTimeSlotSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    collaborators: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
});
exports.customScheduleWithParticipantsSchema = new mongoose_1.Schema({
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    timeSlots: [exports.eventTimeSlotSchema],
});
exports.eventSchema = new mongoose_1.Schema({
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
        type: [exports.customScheduleWithParticipantsSchema],
        required: [true, "Please add a schedule"],
    },
    place: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Place",
        required: [true, "Please add a place"],
    },
    image: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Image",
        required: false,
    },
    status: {
        type: String,
        enum: ["cancelled", "full", "available"],
        default: "available",
    },
    deleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Event", exports.eventSchema);
