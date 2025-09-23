"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEvent = exports.getEventById = exports.getEventsByPlaceId = exports.createEvent = exports.updateEvent = void 0;
const Event_1 = __importDefault(require("../models/Event"));
const mongoose_1 = __importDefault(require("mongoose"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const eventValidations_1 = require("../validations/eventValidations");
const Partnership_1 = require("../models/Partnership");
const Image_1 = __importDefault(require("../models/Image"));
const createEvent = async (req, res) => {
    try {
        const placeId = req.placeId;
        const validationResult = (0, eventValidations_1.validateEventData)(req.body, false);
        if (!validationResult.isValid) {
            (0, response_1.APIResponse)(res, validationResult.errors, "Validation failed", 400);
            return;
        }
        req.body.place = new mongoose_1.default.Types.ObjectId(placeId);
        const event = await Event_1.default.create(req.body);
        (0, response_1.APIResponse)(res, event._id, "Event created successfully", 201);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, response_1.APIResponse)(res, null, `Failed to create event: ${error.message}`, 500);
        }
        else {
            (0, response_1.APIResponse)(res, null, "Failed to create event", 500);
        }
        logger_1.default.error("Error creating event:", error);
    }
};
exports.createEvent = createEvent;
const getEventsByPlaceId = async (req, res) => {
    try {
        const { placeId } = req.params;
        if (!placeId) {
            (0, response_1.APIResponse)(res, null, "Place ID is required", 400);
            return;
        }
        const events = await Event_1.default.find({
            place: new mongoose_1.default.Types.ObjectId(placeId),
        })
            .select("name image place description status schedule")
            .populate({ path: "image", model: "Image", select: "_id urls" })
            .populate({ path: "place", model: "Place", select: "_id name" })
            .lean();
        (0, response_1.APIResponse)(res, events, "Events fetched successfully", 200);
    }
    catch (error) {
        (0, response_1.APIResponse)(res, null, "Failed to fetch events", 500);
        logger_1.default.error("Error fetching events:", error);
    }
};
exports.getEventsByPlaceId = getEventsByPlaceId;
const getEventById = async (req, res) => {
    try {
        const { eventId } = req.params;
        const event = await Event_1.default.findById(eventId)
            .populate({
            path: "place",
            model: "Place",
            select: "_id location image name",
            populate: {
                path: "image",
                model: "Image",
                select: "urls",
            },
        })
            .populate({ path: "image", model: "Image", select: "_id urls" })
            .populate({
            path: "schedule.timeSlots.collaborators",
            model: "User",
            select: "_id creatorName image",
            populate: {
                path: "image",
                model: "Image",
            },
        })
            .lean();
        if (!event) {
            (0, response_1.APIResponse)(res, null, "Event not found", 404);
            return;
        }
        const updatedEvent = {
            ...event,
            schedule: event.schedule.map((period) => ({
                ...period,
                timeSlots: period.timeSlots.map((slot) => ({
                    ...slot,
                    collaborators: slot.collaborators.map((collaborator) => ({
                        name: collaborator.creatorName,
                        image: collaborator.image.urls.thumbnail,
                        _id: collaborator._id,
                    })),
                })),
            })),
        };
        (0, response_1.APIResponse)(res, updatedEvent, "Event fetched successfully", 200);
    }
    catch (error) {
        (0, response_1.APIResponse)(res, null, "Failed to fetch event", 500);
        logger_1.default.error("Error fetching event:", error);
    }
};
exports.getEventById = getEventById;
const updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!eventId) {
            (0, response_1.APIResponse)(res, null, "Event ID is required", 400);
            return;
        }
        const validationResult = (0, eventValidations_1.validateEventData)(req.body, true);
        if (!validationResult.isValid) {
            (0, response_1.APIResponse)(res, validationResult.errors, "Validation failed", 400);
            return;
        }
        const event = await Event_1.default.findByIdAndUpdate(eventId, req.body, {
            new: true,
        });
        if (!event) {
            (0, response_1.APIResponse)(res, null, "Event not found", 404);
            return;
        }
        (0, response_1.APIResponse)(res, event._id, "Event updated successfully", 200);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, response_1.APIResponse)(res, null, `Failed to update event: ${error.message}`, 500);
        }
        else {
            (0, response_1.APIResponse)(res, null, "Failed to update event", 500);
        }
        logger_1.default.error("Error updating event:", error);
    }
};
exports.updateEvent = updateEvent;
const deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!eventId) {
            (0, response_1.APIResponse)(res, null, "Event ID is required", 400);
            return;
        }
        await Event_1.default.findByIdAndDelete(eventId);
        await Image_1.default.deleteMany({
            reference: eventId,
            referenceType: "Event",
        });
        await Partnership_1.Partnership.deleteMany({ event: eventId });
        (0, response_1.APIResponse)(res, null, "Event deleted successfully", 200);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, response_1.APIResponse)(res, null, `Failed to delete event: ${error.message}`, 500);
        }
        else {
            (0, response_1.APIResponse)(res, null, "Failed to delete event", 500);
        }
        logger_1.default.error("Error deleting event:", error);
    }
};
exports.deleteEvent = deleteEvent;
