"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchPlaces = exports.getPlacesInView = exports.getPlaceById = exports.createPlace = exports.updatePlace = void 0;
const userHelpers_1 = require("../helpers/userHelpers");
const Place_1 = __importDefault(require("../models/Place"));
const User_1 = __importDefault(require("../models/User"));
const Event_1 = __importDefault(require("../models/Event"));
const s3_1 = require("../types/s3");
const mongoose_1 = __importDefault(require("mongoose"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const schedule_1 = require("../utils/schedule");
const placeValidations_1 = require("../validations/placeValidations");
const updatePlace = async (req, res) => {
    try {
        const placeId = req.placeId;
        const validationResult = req.body;
        const { name, description, location, phone, email, website, placeCategory, placeType, defaultSchedule, } = validationResult.data;
        const updateData = {
            name,
            description,
            location,
            phone,
            email,
            website,
            placeCategory: new mongoose_1.default.Types.ObjectId(placeCategory),
            placeType,
            defaultSchedule,
        };
        const place = await Place_1.default.findByIdAndUpdate(placeId, updateData);
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
        if (req.decoded.userType === "guest") {
            (0, response_1.APIResponse)(res, null, "Only creators and organizers can create places", 403);
            return;
        }
        const validationResult = (0, placeValidations_1.validateNewPlaceData)(req.body, req.decoded.userType);
        if (!validationResult.isValid) {
            (0, response_1.APIResponse)(res, validationResult.errors, "Validation failed", 400);
            return;
        }
        if (req.decoded.userType === "creator") {
            req.body.isCreatorPlace = true;
        }
        const place = await Place_1.default.create(req.body);
        await User_1.default.findByIdAndUpdate(req.decoded.id, {
            $push: { places: place._id },
        });
        (0, response_1.APIResponse)(res, place, "Place created successfully", 201);
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
            path: "user",
            model: "User",
            select: "creatorProfile.categories",
            populate: {
                path: "creatorProfile.categories",
                model: "SubCategory",
            },
        })
            .lean();
        if (!place) {
            (0, response_1.APIResponse)(res, null, "Place not found", 404);
            return;
        }
        if (enrichSchedule === "true") {
            const events = await Event_1.default.find({
                place: placeId,
                status: { $in: ["upcoming", "ongoing"] },
            }).select("name schedule");
            const formattedEvents = events.map((event) => ({
                _id: event._id.toString(),
                name: event.name,
                schedule: event.schedule.map((period) => ({
                    startDate: period.startDate,
                    endDate: period.endDate,
                })),
            }));
            const enrichedSchedule = (0, schedule_1.enrichScheduleWithEvents)(place.defaultSchedule, formattedEvents);
            place.defaultSchedule = enrichedSchedule;
        }
        if (place.image) {
            place.image = await (0, s3_1.generateSignedUrlFromFullUrl)(place.image);
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
        const { placeType, placeCategories, startDate, endDate } = (0, userHelpers_1.parseJson)(filters, {
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
        let places;
        if (startDate || endDate) {
            const aggregationPipeline = [
                { $match: query },
                {
                    $lookup: {
                        from: "events",
                        localField: "_id",
                        foreignField: "placeId",
                        as: "events",
                    },
                },
                {
                    $match: {
                        events: {
                            $elemMatch: {
                                status: { $in: ["upcoming", "ongoing"] },
                                schedule: {
                                    $elemMatch: {
                                        $and: [
                                            ...(startDate
                                                ? [{ endDate: { $gte: new Date(startDate) } }]
                                                : []),
                                            ...(endDate
                                                ? [{ startDate: { $lte: new Date(endDate) } }]
                                                : []),
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
                {
                    $project: {
                        location: 1,
                        placeCategory: 1,
                        isCreatorPlace: 1,
                        name: 1,
                    },
                },
                {
                    $lookup: {
                        from: "placecategories",
                        localField: "placeCategory",
                        foreignField: "_id",
                        as: "placeCategory",
                    },
                },
                {
                    $unwind: {
                        path: "$placeCategory",
                        preserveNullAndEmptyArrays: true,
                    },
                },
                { $limit: queryLimit },
            ];
            places = await Place_1.default.aggregate(aggregationPipeline);
        }
        else {
            places = await Place_1.default.find(query)
                .select("location placeCategory isCreatorPlace name")
                .populate({
                path: "placeCategory",
                model: "PlaceCategory",
            })
                .limit(queryLimit)
                .lean();
        }
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
        const { name, limit = "10" } = req.query;
        if (!name || name.length < 3) {
            (0, response_1.APIResponse)(res, [], "Search query must be at least 2 characters", 200);
            return;
        }
        const maxLimit = 20;
        const queryLimit = Math.min(parseInt(limit), maxLimit);
        const places = await Place_1.default.find({
            name: { $regex: name, $options: "i" },
            active: true,
            deleted: false,
        })
            .select("_id name location.label image placeCategory")
            .populate({
            path: "placeCategory",
            model: "PlaceCategory",
            select: "name",
        })
            .limit(queryLimit)
            .lean();
        const placesWithSignedUrls = await Promise.all(places.map(async (place) => {
            if (place.image) {
                place.image = await (0, s3_1.generateSignedUrlFromFullUrl)(place.image);
            }
            return place;
        }));
        (0, response_1.APIResponse)(res, placesWithSignedUrls, "Places searched successfully", 200);
    }
    catch (error) {
        logger_1.default.error("Error searching places:", error);
        (0, response_1.APIResponse)(res, null, "Failed to search places", 500);
    }
};
exports.searchPlaces = searchPlaces;
