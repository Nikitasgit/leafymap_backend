"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUserInPlacesAndEvents = exports.findCreators = exports.updateCreator = exports.addOrganizer = exports.addCreator = exports.getUserById = void 0;
const User_1 = __importDefault(require("../models/User"));
const Place_1 = __importDefault(require("../models/Place"));
const Event_1 = __importDefault(require("../models/Event"));
const s3_1 = require("../types/s3");
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const jwt_1 = require("../utils/jwt");
const mongoose_1 = __importDefault(require("mongoose"));
const userValidation_1 = require("../validations/userValidation");
const placeValidations_1 = require("../validations/placeValidations");
const Partnership_1 = require("../models/Partnership");
const getUserById = async (req, res) => {
    var _a;
    try {
        const userId = req.params.userId;
        const user = await User_1.default.findById(userId)
            .select("-password -createdAt -updatedAt -interests  -deleted -__v")
            .populate({
            path: "creatorProfile.categories",
            model: "SubCategory",
        })
            .populate({
            path: "creatorProfile.place",
            populate: {
                path: "placeCategory",
                model: "PlaceCategory",
            },
        })
            .populate({
            path: "places",
            model: "Place",
        });
        if (!user) {
            (0, response_1.APIResponse)(res, null, "User not found", 404);
            return;
        }
        if (user === null || user === void 0 ? void 0 : user.places) {
            await Promise.all(user.places.map(async (place) => {
                if (place.image) {
                    place.image = await (0, s3_1.generateSignedUrlFromFullUrl)(place.image);
                }
            }));
        }
        if (user === null || user === void 0 ? void 0 : user.image) {
            const signedUrl = await (0, s3_1.generateSignedUrlFromFullUrl)(user.image);
            user.image = signedUrl;
        }
        if ((user === null || user === void 0 ? void 0 : user.userType) === "creator" && ((_a = user === null || user === void 0 ? void 0 : user.creatorProfile) === null || _a === void 0 ? void 0 : _a.place)) {
            const place = user.creatorProfile.place;
            if (place === null || place === void 0 ? void 0 : place.image) {
                place.image = await (0, s3_1.generateSignedUrlFromFullUrl)(place.image);
            }
        }
        (0, response_1.APIResponse)(res, { user }, "User fetched successfully", 200);
    }
    catch (err) {
        logger_1.default.error("Error getting user:", err);
        (0, response_1.APIResponse)(res, null, "Server error", 500);
    }
};
exports.getUserById = getUserById;
const addCreator = async (req, res) => {
    const parseResult = req.body;
    if (!parseResult.success) {
        (0, response_1.APIResponse)(res, null, "Validation error", 400);
        return;
    }
    const data = parseResult.data;
    try {
        const { name, description, category, placeCategory, location, defaultSchedule, placeActive, phone, placeType, email, website, } = data;
        const user = await User_1.default.findById(req.decoded.id).select("_id userType");
        if (!user) {
            (0, response_1.APIResponse)(res, null, "User not found", 404);
            return;
        }
        if (user.userType !== "guest") {
            (0, response_1.APIResponse)(res, null, "User has already an updated profile", 400);
            return;
        }
        if (phone) {
            const existingUserWithPhone = await User_1.default.findOne({
                phone,
                _id: { $ne: req.decoded.id },
            });
            if (existingUserWithPhone) {
                (0, response_1.APIResponse)(res, null, "Ce numéro de téléphone est déjà utilisé par un autre utilisateur", 400);
                return;
            }
        }
        if (email) {
            const existingUserWithEmail = await User_1.default.findOne({
                email,
                _id: { $ne: req.decoded.id },
            });
            if (existingUserWithEmail) {
                (0, response_1.APIResponse)(res, null, "Cet email est déjà utilisé par un autre utilisateur", 400);
                return;
            }
        }
        user.userType = "creator";
        user.description = description || user.description;
        user.phone = phone || user.phone;
        user.email = email || user.email;
        user.website = website || user.website;
        user.creatorProfile = {
            name,
            categories: [new mongoose_1.default.Types.ObjectId(category)],
        };
        let place = null;
        if (placeActive) {
            place = new Place_1.default({
                name,
                description,
                user: user._id,
                location,
                placeType,
                isCreatorPlace: true,
                placeCategory,
                defaultSchedule,
            });
            await place.save();
            user.creatorProfile.place = place._id;
        }
        await user.save();
        const newToken = (0, jwt_1.generateToken)({
            id: user._id.toString(),
            userType: user.userType,
        });
        (0, jwt_1.setTokenCookie)(res, newToken);
        (0, response_1.APIResponse)(res, { user, place }, "Creator profile added successfully", 201);
    }
    catch (err) {
        logger_1.default.error("Error adding creator:", err);
        (0, response_1.APIResponse)(res, null, "Server error", 500);
    }
};
exports.addCreator = addCreator;
const addOrganizer = async (req, res) => {
    const validationResult = (0, placeValidations_1.validateNewPlaceData)(req.body, "organizer");
    if (!validationResult.isValid) {
        (0, response_1.APIResponse)(res, validationResult.errors, "Validation error", 400);
        return;
    }
    const data = req.body;
    try {
        const { name, description, placeCategory, placeType, location, defaultSchedule, phone, email, website, collaborators, } = data;
        const user = await User_1.default.findById(req.decoded.id).select("_id userType places");
        if (!user) {
            (0, response_1.APIResponse)(res, null, "User not found", 404);
            return;
        }
        if (user.userType !== "guest") {
            (0, response_1.APIResponse)(res, null, "User can not be an organizer", 400);
            return;
        }
        if (!location) {
            (0, response_1.APIResponse)(res, null, "Location is required", 400);
            return;
        }
        user.userType = "organizer";
        const place = new Place_1.default({
            name: name,
            description,
            user: user._id,
            phone,
            email,
            website,
            location,
            placeCategory,
            placeType,
            defaultSchedule,
        });
        await place.save();
        user.places.push(place._id);
        if (collaborators && collaborators.length > 0) {
            const partnerships = collaborators.map(async (collaborator) => {
                const partnership = new Partnership_1.Partnership({
                    place: place._id,
                    initiator: user._id,
                    collaborator: collaborator._id,
                });
                await partnership.save();
            });
            await Promise.all(partnerships);
        }
        await user.save();
        const newToken = (0, jwt_1.generateToken)({
            id: user._id.toString(),
            userType: user.userType,
        });
        (0, jwt_1.setTokenCookie)(res, newToken);
        (0, response_1.APIResponse)(res, { user, place }, "Organizer profile added successfully", 201);
    }
    catch (err) {
        logger_1.default.error("Error adding organizer:", err);
        (0, response_1.APIResponse)(res, null, "Server error", 500);
    }
};
exports.addOrganizer = addOrganizer;
const updateCreator = async (req, res) => {
    const data = req.body;
    try {
        const { name, description, category, placeCategory, location, defaultSchedule, phone, email, website, placeActive, } = data;
        const user = await User_1.default.findById(req.decoded.id);
        if (!user) {
            (0, response_1.APIResponse)(res, null, "User not found", 404);
            return;
        }
        if (user.userType !== "creator") {
            (0, response_1.APIResponse)(res, null, "User is not a creator", 400);
            return;
        }
        if (phone && phone !== user.phone) {
            const existingUserWithPhone = await User_1.default.findOne({
                phone,
                _id: { $ne: req.decoded.id },
            });
            if (existingUserWithPhone) {
                (0, response_1.APIResponse)(res, null, "Ce numéro de téléphone est déjà utilisé par un autre utilisateur", 400);
                return;
            }
        }
        if (email && email !== user.email) {
            const existingUserWithEmail = await User_1.default.findOne({
                email,
                _id: { $ne: req.decoded.id },
            });
            if (existingUserWithEmail) {
                (0, response_1.APIResponse)(res, null, "Cet email est déjà utilisé par un autre utilisateur", 400);
                return;
            }
        }
        user.description = description || user.description;
        user.phone = phone || user.phone;
        user.email = email || user.email;
        user.website = website || user.website;
        if (!user.creatorProfile) {
            user.creatorProfile = { name: "", categories: [] };
        }
        user.creatorProfile.name = name || user.creatorProfile.name;
        if (category) {
            user.creatorProfile.categories = [new mongoose_1.default.Types.ObjectId(category)];
        }
        let place = null;
        if (user.creatorProfile.place) {
            place = await Place_1.default.findById(user.creatorProfile.place);
            if (!place) {
                (0, response_1.APIResponse)(res, null, "Place not found", 404);
                return;
            }
            place.name = name || place.name;
            place.active = placeActive || place.active;
            place.placeType = place.placeType;
            place.placeCategory = new mongoose_1.default.Types.ObjectId(placeCategory);
            place.description = description || place.description;
            place.placeCategory = new mongoose_1.default.Types.ObjectId(placeCategory);
            if (location) {
                place.location = location;
                place.defaultSchedule = defaultSchedule || place.defaultSchedule;
            }
            await place.save();
        }
        else if (location) {
            place = new Place_1.default({
                name,
                user: user._id,
                location,
                isCreatorPlace: true,
                placeCategory,
                defaultSchedule,
            });
            await place.save();
            user.creatorProfile.place = place._id;
        }
        await user.save();
        (0, response_1.APIResponse)(res, { user, place }, "Creator profile updated successfully", 200);
    }
    catch (err) {
        logger_1.default.error("Error updating creator:", err);
        (0, response_1.APIResponse)(res, null, "Server error", 500);
    }
};
exports.updateCreator = updateCreator;
const findCreators = async (req, res) => {
    const parseResult = req.query;
    if (!parseResult.success) {
        (0, response_1.APIResponse)(res, null, "Validation error", 400);
        return;
    }
    const query = parseResult;
    try {
        const { name, limit = 10 } = query;
        const queryFilter = {};
        const user = await User_1.default.findById(req.decoded.id);
        if ((user === null || user === void 0 ? void 0 : user.userType) === "creator") {
            queryFilter._id = { $ne: req.decoded.id };
        }
        if (name) {
            queryFilter["creatorProfile.name"] = { $regex: name, $options: "i" };
        }
        const users = await User_1.default.find(queryFilter)
            .select("creatorProfile.name image")
            .limit(parseInt(limit));
        for (let user of users) {
            if (user === null || user === void 0 ? void 0 : user.image) {
                user.image = await (0, s3_1.generateSignedUrlFromFullUrl)(user.image);
            }
        }
        (0, response_1.APIResponse)(res, users, "Users fetched successfully", 200);
    }
    catch (err) {
        logger_1.default.error("Error finding users:", err);
        (0, response_1.APIResponse)(res, null, "Server error", 500);
    }
};
exports.findCreators = findCreators;
const getUserInPlacesAndEvents = async (req, res) => {
    const parseResult = req.query;
    if (!parseResult.success) {
        (0, response_1.APIResponse)(res, null, "Validation error", 400);
        return;
    }
    const query = parseResult;
    try {
        const { userId } = query;
        if (!userId) {
            (0, response_1.APIResponse)(res, null, "userId parameter is required", 400);
            return;
        }
        const user = await User_1.default.findById(userId)
            .select("_id creatorProfile.name image creatorProfile.categories creatorProfile.place")
            .populate({
            path: "creatorProfile.categories",
            model: "SubCategory",
            select: "name",
        })
            .populate({
            path: "creatorProfile.place",
            model: "Place",
            select: "location",
        });
        if (!user) {
            (0, response_1.APIResponse)(res, { places: [] }, "User not found", 200);
            return;
        }
        const userEvents = await Event_1.default.find({
            "collaborators.user": { $in: user._id },
            "collaborators.status": "accepted",
            status: { $in: ["upcoming", "ongoing"] },
        })
            .select("_id name placeId image")
            .lean();
        const eventPlaceIds = userEvents
            .map((event) => event.place)
            .filter(Boolean);
        const allPlaces = await Place_1.default.find({
            $and: [
                { active: true },
                {
                    $or: [
                        {
                            "collaborators.user": { $in: user._id },
                            "collaborators.status": "accepted",
                        },
                        { _id: { $in: eventPlaceIds } },
                    ],
                },
            ],
        })
            .select("_id name location image")
            .lean();
        const placeEventsMap = new Map();
        allPlaces.forEach((place) => {
            placeEventsMap.set(place._id.toString(), {
                place,
                events: [],
            });
        });
        userEvents.forEach((event) => {
            if (event.place) {
                const placeId = event.place.toString();
                if (placeEventsMap.has(placeId)) {
                    placeEventsMap.get(placeId).events.push(event);
                }
            }
        });
        if (user === null || user === void 0 ? void 0 : user.image) {
            user.image = await (0, s3_1.generateSignedUrlFromFullUrl)(user.image);
        }
        await Promise.all(Array.from(placeEventsMap.values()).map(async (placeData) => {
            var _a;
            if ((_a = placeData.place) === null || _a === void 0 ? void 0 : _a.image) {
                placeData.place.image = await (0, s3_1.generateSignedUrlFromFullUrl)(placeData.place.image);
            }
            await Promise.all(placeData.events.map(async (event) => {
                if (event === null || event === void 0 ? void 0 : event.image) {
                    event.image = await (0, s3_1.generateSignedUrlFromFullUrl)(event.image);
                }
            }));
        }));
        const formattedResults = {
            user,
            places: Array.from(placeEventsMap.values()),
        };
        (0, response_1.APIResponse)(res, formattedResults, "Search results fetched successfully", 200);
    }
    catch (error) {
        logger_1.default.error("Error fetching places by search:", error);
        (0, response_1.APIResponse)(res, null, "Failed to fetch places by search", 500);
    }
};
exports.getUserInPlacesAndEvents = getUserInPlacesAndEvents;
const updateUser = async (req, res) => {
    const validationResult = (0, userValidation_1.validateNewUserData)(req.body);
    if (!validationResult.isValid) {
        (0, response_1.APIResponse)(res, validationResult.errors, "Validation error", 400);
        return;
    }
    try {
        await User_1.default.findByIdAndUpdate(req.decoded.id, req.body, { new: true });
        (0, response_1.APIResponse)(res, null, "User updated successfully", 200);
    }
    catch (error) {
        logger_1.default.error("Error updating user:", error);
        (0, response_1.APIResponse)(res, null, "Server error", 500);
    }
};
exports.updateUser = updateUser;
