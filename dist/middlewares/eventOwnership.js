"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = __importDefault(require("../models/Event"));
const response_1 = require("../utils/response");
const eventOwnership = async (req, res, next) => {
    try {
        const placeId = req.placeId;
        const { eventId } = req.params;
        if (!eventId) {
            (0, response_1.APIResponse)(res, null, "Event ID is required", 400);
            return;
        }
        const event = await Event_1.default.findById(eventId).select("place");
        if (!event) {
            (0, response_1.APIResponse)(res, null, "Event not found", 404);
            return;
        }
        if (event.place.toString() !== placeId) {
            (0, response_1.APIResponse)(res, null, "You can't update this event", 403);
            return;
        }
        next();
    }
    catch (error) {
        (0, response_1.APIResponse)(res, null, "Failed to verify event ownership", 500);
    }
};
exports.default = eventOwnership;
