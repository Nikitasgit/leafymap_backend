"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventById = exports.getEventsByPlaceId = exports.createEvent = exports.updateEvent = void 0;
const Event_1 = __importDefault(require("../models/Event"));
const mongoose_1 = __importDefault(require("mongoose"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const s3_1 = require("../types/s3");
const createEvent = async (req, res) => {
    try {
        const placeId = req.placeId;
        const { name, description, schedule } = req.body;
        if (!name || !description || !schedule) {
            (0, response_1.APIResponse)(res, null, "Name, description, and schedule are required", 400);
            return;
        }
        const eventData = {
            name,
            description,
            schedule,
            place: new mongoose_1.default.Types.ObjectId(placeId),
            status: "upcoming",
        };
        const event = await Event_1.default.create(eventData);
        (0, response_1.APIResponse)(res, event, "Event created successfully", 201);
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
        const { id } = req.params;
        if (!id) {
            (0, response_1.APIResponse)(res, null, "Place ID is required", 400);
            return;
        }
        const events = await Event_1.default.find({
            place: new mongoose_1.default.Types.ObjectId(id),
        }).populate([
            {
                path: "schedule.timeSlots.collaborators.user",
                model: "User",
                select: "_id username image",
            },
        ]);
        const eventsWithSignedUrls = await Promise.all(events.map(async (event) => {
            const eventObj = event.toObject();
            if (eventObj.image) {
                eventObj.image = await (0, s3_1.generateSignedUrlFromFullUrl)(eventObj.image);
            }
            // Process collaborators in timeSlots
            if (eventObj.schedule) {
                eventObj.schedule = await Promise.all(eventObj.schedule.map(async (period) => {
                    if (period.timeSlots) {
                        period.timeSlots = await Promise.all(period.timeSlots.map(async (slot) => {
                            if (slot.collaborators) {
                                slot.collaborators = await Promise.all(slot.collaborators.map(async (collaborator) => {
                                    if (collaborator._id && collaborator._id.image) {
                                        collaborator._id.image =
                                            await (0, s3_1.generateSignedUrlFromFullUrl)(collaborator._id.image);
                                    }
                                    return collaborator;
                                }));
                            }
                            return slot;
                        }));
                    }
                    return period;
                }));
            }
            return eventObj;
        }));
        (0, response_1.APIResponse)(res, eventsWithSignedUrls, "Events fetched successfully", 200);
    }
    catch (error) {
        (0, response_1.APIResponse)(res, null, "Failed to fetch events", 500);
        logger_1.default.error("Error fetching events:", error);
    }
};
exports.getEventsByPlaceId = getEventsByPlaceId;
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Event_1.default.findById(id)
            .populate([{ path: "place", model: "Place", select: "_id" }])
            .populate([
            {
                path: "schedule.timeSlots.collaborators",
                model: "User",
                select: "_id creatorProfile.name image",
            },
        ])
            .lean();
        if (!event) {
            (0, response_1.APIResponse)(res, null, "Event not found", 404);
            return;
        }
        const updatedEvent = {
            ...event,
            schedule: await Promise.all(event.schedule.map(async (period) => ({
                ...period,
                timeSlots: await Promise.all(period.timeSlots.map(async (slot) => ({
                    ...slot,
                    collaborators: await Promise.all(slot.collaborators.map(async (collaborator) => ({
                        _id: collaborator._id,
                        name: collaborator.creatorProfile.name,
                        image: collaborator.image
                            ? await (0, s3_1.generateSignedUrlFromFullUrl)(collaborator.image)
                            : "",
                    }))),
                }))),
            }))),
        };
        if (updatedEvent.image) {
            updatedEvent.image = await (0, s3_1.generateSignedUrlFromFullUrl)(updatedEvent.image);
        }
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
        const { name, description, schedule, status } = req.body;
        const transformedSchedule = schedule.map((period) => ({
            startDate: new Date(period.startDate),
            endDate: new Date(period.endDate),
            timeSlots: (period.timeSlots || []).map((slot) => ({
                title: slot.title || "",
                startTime: slot.startTime || "",
                endTime: slot.endTime || "",
                collaborators: slot.collaborators.map((collaborator) => ({
                    _id: new mongoose_1.default.Types.ObjectId(collaborator._id),
                })),
            })),
        }));
        if (transformedSchedule.length === 0) {
            (0, response_1.APIResponse)(res, null, "Schedule must contain at least one period", 400);
            return;
        }
        // Validate that each period has valid dates
        for (const period of transformedSchedule) {
            if (!period.startDate || !period.endDate) {
                (0, response_1.APIResponse)(res, null, "Each schedule period must have valid dates", 400);
                return;
            }
        }
        const updateData = {
            name,
            description,
            schedule: transformedSchedule,
        };
        if (status) {
            updateData.status = status;
        }
        const event = await Event_1.default.findByIdAndUpdate(eventId, updateData, {
            new: true,
        });
        if (!event) {
            (0, response_1.APIResponse)(res, null, "Event not found", 404);
            return;
        }
        (0, response_1.APIResponse)(res, event, "Event updated successfully", 200);
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
