"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collaboratorSchema = exports.customDateSchema = void 0;
const mongoose_1 = require("mongoose");
const timeSlotSchema = new mongoose_1.Schema({
    startTime: { type: String, default: "" },
    endTime: { type: String, default: "" },
}, { _id: false });
const defaultScheduleSchema = new mongoose_1.Schema({
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
}, { _id: false });
exports.customDateSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    open: { type: Boolean, required: true },
    timeSlots: [timeSlotSchema],
}, { _id: false });
exports.collaboratorSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
        type: String,
        enum: ["pending", "accepted", "refused"],
        required: true,
        default: "pending",
    },
}, { _id: false });
const locationSchema = new mongoose_1.Schema({
    type: { type: String, enum: ["Point"], required: true },
    coordinates: {
        type: [Number],
        required: true,
        index: "2dsphere",
    },
    label: { type: String, required: true },
    id: { type: String, required: true },
}, { _id: false });
const placeSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    location: locationSchema,
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    image: { type: mongoose_1.Schema.Types.ObjectId, ref: "Image" },
    active: { type: Boolean, default: true },
    deleted: { type: Boolean, default: false },
    isCreatorPlace: { type: Boolean, required: true, default: false },
    rating: { type: Number, default: 0 },
    followers: { type: [mongoose_1.Schema.Types.ObjectId], ref: "User", default: [] },
    placeCategory: {
        type: mongoose_1.Schema.Types.ObjectId,
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
    customDates: [exports.customDateSchema],
});
placeSchema.index({ "location.coordinates": "2dsphere" });
exports.default = (0, mongoose_1.model)("Place", placeSchema);
