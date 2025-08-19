"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadProfilePicture = void 0;
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const User_1 = __importDefault(require("../models/User"));
const Place_1 = __importDefault(require("../models/Place"));
const Event_1 = __importDefault(require("../models/Event"));
const mongoose_1 = __importDefault(require("mongoose"));
const s3_1 = require("../types/s3");
const uploadProfilePicture = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.decoded.id);
        if (!user) {
            (0, response_1.APIResponse)(res, null, "User not found", 404);
            return;
        }
        const { entityType, entityId } = req.body;
        if (!["user", "place", "event"].includes(entityType)) {
            (0, response_1.APIResponse)(res, null, "Invalid entity type", 400);
            return;
        }
        if (entityType !== "user" && !entityId) {
            (0, response_1.APIResponse)(res, null, `${entityType} ID is required`, 400);
            return;
        }
        if (!req.file || !req.file.location) {
            (0, response_1.APIResponse)(res, null, "No image file provided or invalid file", 400);
            return;
        }
        const imageUrl = req.file.location;
        switch (entityType) {
            case "user":
                await handleUserProfilePicture(user._id, imageUrl);
                break;
            case "place":
                await handlePlaceProfilePicture(user._id, entityId, imageUrl);
                break;
            case "event":
                await handleEventProfilePicture(user._id, entityId, imageUrl);
                break;
        }
        const signedImageUrl = await (0, s3_1.generateSignedUrlFromFullUrl)(imageUrl);
        (0, response_1.APIResponse)(res, { imageUrl: signedImageUrl }, "Profile picture uploaded successfully", 200);
    }
    catch (error) {
        logger_1.default.error("Error uploading profile picture:", error);
        if (error instanceof Error) {
            (0, response_1.APIResponse)(res, null, `Failed to upload profile picture: ${error.message}`, 500);
        }
        else {
            (0, response_1.APIResponse)(res, null, "Failed to upload profile picture", 500);
        }
    }
};
exports.uploadProfilePicture = uploadProfilePicture;
const handleUserProfilePicture = async (userId, imageUrl) => {
    const user = await User_1.default.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }
    user.image = imageUrl;
    await user.save();
};
const handlePlaceProfilePicture = async (userId, placeId, imageUrl) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(placeId)) {
        throw new Error("Invalid Place ID format");
    }
    const place = await Place_1.default.findById(placeId);
    if (!place) {
        throw new Error("Place not found");
    }
    if (place.user.toString() !== userId) {
        throw new Error("You can only update profile pictures for your own places");
    }
    place.image = imageUrl;
    await place.save();
};
const handleEventProfilePicture = async (userId, eventId, imageUrl) => {
    if (!mongoose_1.default.Types.ObjectId.isValid(eventId)) {
        throw new Error("Invalid Event ID format");
    }
    const event = await Event_1.default.findById(eventId);
    if (!event) {
        throw new Error("Event not found");
    }
    const place = await Place_1.default.findById(event.place);
    if (!place || place.user.toString() !== userId) {
        throw new Error("You can only update profile pictures for events in your places");
    }
    event.image = imageUrl;
    await event.save();
};
