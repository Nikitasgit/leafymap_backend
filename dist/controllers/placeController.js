"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlace = exports.searchPlaces = exports.getPlacesInView = exports.getPlaceById = exports.createPlace = exports.updatePlace = void 0;
const jsonHandlers_1 = require("../utils/jsonHandlers");
const Place_1 = __importDefault(require("../models/Place"));
const User_1 = __importDefault(require("../models/User"));
const Event_1 = __importDefault(require("../models/Event"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const schedule_1 = require("../utils/schedule");
const placeValidations_1 = require("../validations/placeValidations");
const services_1 = require("../services");
const Image_1 = __importDefault(require("../models/Image"));
const Partnership_1 = require("../models/Partnership");
const updatePlace = async (req, res) => {
    try {
        const placeId = req.placeId;
        const decoded = req.decoded;
        if (decoded.userType === "creator") {
            const user = await User_1.default.findById(decoded.id).select("creatorName creatorCategories");
            if (!user) {
                (0, response_1.APIResponse)(res, null, "User not found", 404);
                return;
            }
            req.body.isCreatorPlace = true;
            req.body.name = user.creatorName;
        }
        const validationResult = (0, placeValidations_1.validatePlaceData)(req.body, decoded.userType, true);
        if (!validationResult.isValid) {
            (0, response_1.APIResponse)(res, validationResult.errors, "Validation failed", 400);
            return;
        }
        const place = await Place_1.default.findByIdAndUpdate(placeId, req.body);
        (0, response_1.APIResponse)(res, place, "Place updated successfully", 200);
    }
    catch (error) {
        logger_1.default.error("Error updating place:", error);
        (0, response_1.APIResponse)(res, null, "Failed to update place", 500);
    }
};
exports.updatePlace = updatePlace;
const createPlace = async (req, res) => {
    try {
        const decoded = req.decoded;
        if (!["creator", "organizer"].includes(decoded.userType)) {
            (0, response_1.APIResponse)(res, null, "Only creators and organizers can create places", 403);
            return;
        }
        const user = await User_1.default.findById(decoded.id).select("creatorName places");
        if (!user) {
            (0, response_1.APIResponse)(res, null, "User not found", 404);
            return;
        }
        if (user.places.length === 1 && decoded.userType === "creator") {
            (0, response_1.APIResponse)(res, null, "Creator already have a place", 400);
        }
        if (user.places.length === 3 && decoded.userType === "organizer") {
            (0, response_1.APIResponse)(res, null, "Organizer already have 3 places", 400);
        }
        if (decoded.userType === "creator") {
            req.body.isCreatorPlace = true;
            req.body.name = user.creatorName;
        }
        req.body.user = decoded.id;
        const validationResult = (0, placeValidations_1.validatePlaceData)(req.body, decoded.userType);
        if (!validationResult.isValid) {
            (0, response_1.APIResponse)(res, validationResult.errors, "Validation failed", 400);
            return;
        }
        const place = await Place_1.default.create(req.body);
        await User_1.default.findByIdAndUpdate(decoded.id, {
            $push: { places: place._id },
        });
        (0, response_1.APIResponse)(res, place._id, "Place created successfully", 201);
    }
    catch (error) {
        logger_1.default.error("Error creating place:", error);
        (0, response_1.APIResponse)(res, null, "Failed to create place", 500);
    }
};
exports.createPlace = createPlace;
const getPlaceById = async (req, res) => {
    try {
        const { placeId } = req.params;
        const { enrichSchedule = "true" } = req.query;
        let place = await Place_1.default.findById(placeId)
            .populate({
            path: "placeCategory",
            model: "PlaceCategory",
        })
            .populate({
            path: "image",
            model: "Image",
            select: "urls",
        })
            .populate({
            path: "user",
            model: "User",
            select: "creatorCategories description",
            populate: {
                path: "creatorCategories",
                model: "SubCategory",
            },
        })
            .lean();
        if (!place) {
            (0, response_1.APIResponse)(res, null, "Place not found", 404);
            return;
        }
        if (place.isCreatorPlace &&
            typeof place.user === "object" &&
            "description" in place.user) {
            place.description = place.user.description;
        }
        if (enrichSchedule === "true") {
            const events = await Event_1.default.find({
                place: placeId,
                status: { $ne: "cancelled" },
            })
                .select("name schedule")
                .lean();
            const enrichedSchedule = (0, schedule_1.enrichScheduleWithEvents)(place.defaultSchedule, events.map((event) => ({
                ...event,
                _id: event._id.toString(),
            })));
            place.defaultSchedule = enrichedSchedule;
        }
        (0, response_1.APIResponse)(res, place, "Place fetched successfully", 200);
    }
    catch (error) {
        logger_1.default.error("Error fetching place:", error);
        (0, response_1.APIResponse)(res, null, "Server error", 500);
    }
};
exports.getPlaceById = getPlaceById;
const getPlacesInView = async (req, res) => {
    try {
        const { ne, sw, filters, limit } = req.query;
        if (!ne || !sw) {
            (0, response_1.APIResponse)(res, null, "Missing required coordinates", 400);
            return;
        }
        let bounds;
        try {
            bounds = {
                ne: JSON.parse(ne),
                sw: JSON.parse(sw),
            };
        }
        catch (error) {
            (0, response_1.APIResponse)(res, null, "Invalid coordinate format", 400);
            return;
        }
        const maxLimit = 100;
        const queryLimit = Math.min(parseInt(limit || "20"), maxLimit);
        const { placeType, placeCategories, startDate, endDate } = (0, jsonHandlers_1.parseJson)(filters, {
            placeType: "all",
            placeCategories: [],
            startDate: null,
            endDate: null,
        });
        const query = {
            location: {
                $geoWithin: {
                    $box: [bounds.sw, bounds.ne],
                },
            },
            active: true,
        };
        if (placeType && placeType !== "all") {
            if (placeType === "art-craft") {
                query.placeType = { $in: ["art", "craft"] };
            }
            else {
                query.placeType = placeType;
            }
        }
        if (placeCategories && placeCategories.length > 0) {
            query.placeCategory = { $in: placeCategories };
        }
        const places = await Place_1.default.find(query)
            .select("location placeCategory isCreatorPlace name")
            .populate({
            path: "placeCategory",
            model: "PlaceCategory",
        })
            .limit(queryLimit)
            .lean();
        (0, response_1.APIResponse)(res, places, "Places fetched successfully", 200);
    }
    catch (error) {
        logger_1.default.error("Error fetching places in view:", error);
        (0, response_1.APIResponse)(res, null, "Failed to fetch places in view", 500);
    }
};
exports.getPlacesInView = getPlacesInView;
const searchPlaces = async (req, res) => {
    try {
        const { name, categoryId, limit = "10" } = req.query;
        const maxLimit = 20;
        const queryLimit = Math.min(parseInt(limit), maxLimit);
        const baseQuery = {
            active: true,
            deleted: false,
        };
        let sortOptions = {};
        if (name && name.length >= 3) {
            baseQuery.name = { $regex: name, $options: "i" };
        }
        else if (categoryId && !name) {
            baseQuery.placeCategory = categoryId;
            sortOptions = { createdAt: -1 };
        }
        else if (!name && !categoryId) {
            sortOptions = { createdAt: -1 };
        }
        else if (name && name.length < 3) {
            (0, response_1.APIResponse)(res, [], "Search query must be at least 3 characters", 200);
            return;
        }
        const places = await Place_1.default.find(baseQuery)
            .select("_id name location.label image placeCategory createdAt description isCreatorPlace user")
            .populate({
            path: "placeCategory",
            model: "PlaceCategory",
            select: "name",
        })
            .populate({
            path: "user",
            model: "User",
            select: "_id",
        })
            .populate({
            path: "image",
            model: "Image",
            select: "urls",
        })
            .sort(sortOptions)
            .limit(queryLimit)
            .lean();
        let message = "Places retrieved successfully";
        if (name) {
            message = "Places searched successfully";
        }
        else if (categoryId) {
            message = "Places by category retrieved successfully";
        }
        else {
            message = "Latest places retrieved successfully";
        }
        (0, response_1.APIResponse)(res, places, message, 200);
    }
    catch (error) {
        logger_1.default.error("Error searching places:", error);
        (0, response_1.APIResponse)(res, null, "Failed to search places", 500);
    }
};
exports.searchPlaces = searchPlaces;
const deletePlace = async (req, res) => {
    try {
        const placeId = req.placeId;
        const decoded = req.decoded;
        const placeEvents = await Event_1.default.find({ place: placeId });
        const eventIds = placeEvents.map((event) => event._id);
        const eventsImages = await Image_1.default.find({
            reference: { $in: eventIds },
            referenceType: "Event",
        });
        const placeImages = await Image_1.default.find({
            reference: placeId,
            referenceType: "Place",
        });
        const allImagesToDelete = [...eventsImages, ...placeImages];
        const imageIds = allImagesToDelete.map((img) => img._id);
        await services_1.ImageService.deleteImages(imageIds);
        await Place_1.default.findByIdAndDelete(placeId);
        await Event_1.default.deleteMany({ place: placeId });
        await Partnership_1.Partnership.deleteMany({ place: placeId });
        await User_1.default.findByIdAndUpdate(decoded.id, {
            $pull: { places: placeId },
        });
        (0, response_1.APIResponse)(res, null, "Place and associated events deleted successfully", 200);
    }
    catch (error) {
        logger_1.default.error("Error deleting place:", error);
        (0, response_1.APIResponse)(res, null, "Failed to delete place", 500);
    }
};
exports.deletePlace = deletePlace;
