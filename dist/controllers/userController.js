"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.updateUser = exports.getUsers = exports.getUserById = void 0;
const User_1 = __importDefault(require("../models/User"));
const Place_1 = __importDefault(require("../models/Place"));
const Event_1 = __importDefault(require("../models/Event"));
const Partnership_1 = require("../models/Partnership");
const Image_1 = __importDefault(require("../models/Image"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const jwt_1 = require("../utils/jwt");
const userValidations_1 = require("../validations/userValidations");
const services_1 = require("../services");
const getUserById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User_1.default.findById(userId)
            .where("deleted", false)
            .select("-password -createdAt -updatedAt -interests  -deleted -__v")
            .populate({
            path: "creatorCategories",
            model: "SubCategory",
        })
            .populate({
            path: "image",
            model: "Image",
            select: "urls",
        })
            .populate({
            path: "places",
            model: "Place",
            populate: {
                path: "image",
                model: "Image",
                select: "urls",
            },
        });
        if (!user) {
            (0, response_1.APIResponse)(res, null, "User not found", 404);
            return;
        }
        (0, response_1.APIResponse)(res, { user }, "User fetched successfully", 200);
    }
    catch (err) {
        logger_1.default.error("Error getting user:", err);
        (0, response_1.APIResponse)(res, null, "Server error", 500);
    }
};
exports.getUserById = getUserById;
const getUsers = async (req, res) => {
    try {
        const { creatorName, limit = 10 } = req.query;
        const queryFilter = {};
        if (creatorName) {
            queryFilter["creatorName"] = { $regex: creatorName, $options: "i" };
        }
        const users = await User_1.default.find(queryFilter)
            .where("deleted", false)
            .select("-password -createdAt -updatedAt -interests -deleted -__v -email -username -userType -phone -website -description -country -address")
            .populate({
            path: "image",
            model: "Image",
            select: "urls",
        })
            .populate({
            path: "creatorCategories",
            model: "SubCategory",
            select: "name",
        })
            .limit(parseInt(limit))
            .lean();
        (0, response_1.APIResponse)(res, users, "Users fetched successfully", 200);
    }
    catch (err) {
        logger_1.default.error("Error finding users:", err);
        (0, response_1.APIResponse)(res, null, "Server error", 500);
    }
};
exports.getUsers = getUsers;
const updateUser = async (req, res) => {
    const validationResult = (0, userValidations_1.validateNewUserData)(req.body);
    if (!validationResult.isValid) {
        (0, response_1.APIResponse)(res, validationResult.errors, "Validation error", 400);
        return;
    }
    try {
        const decoded = req.decoded;
        const userUpdated = await User_1.default.findByIdAndUpdate(decoded.id, req.body, {
            new: true,
        });
        if (!userUpdated) {
            (0, response_1.APIResponse)(res, null, "User not found", 404);
            return;
        }
        const newToken = (0, jwt_1.generateToken)({
            id: userUpdated._id.toString(),
            userType: userUpdated.userType,
        });
        (0, jwt_1.setTokenCookie)(res, newToken);
        (0, response_1.APIResponse)(res, null, "User updated successfully", 200);
    }
    catch (error) {
        logger_1.default.error("Error updating user:", error);
        (0, response_1.APIResponse)(res, null, "Server error", 500);
    }
};
exports.updateUser = updateUser;
const deleteAccount = async (req, res) => {
    try {
        const decoded = req.decoded;
        const userId = decoded.id;
        const user = await User_1.default.findById(userId);
        if (!user) {
            (0, response_1.APIResponse)(res, null, "User not found", 404);
            return;
        }
        const userImages = await Image_1.default.find({
            $or: [{ user: userId }, { reference: userId, referenceType: "User" }],
        });
        const userPlaces = await Place_1.default.find({ user: userId });
        const placeIds = userPlaces.map((place) => place._id);
        const userEvents = await Event_1.default.find({ place: { $in: placeIds } });
        const eventIds = userEvents.map((event) => event._id);
        const placeImages = await Image_1.default.find({
            reference: { $in: placeIds },
            referenceType: "Place",
        });
        const eventImages = await Image_1.default.find({
            reference: { $in: eventIds },
            referenceType: "Event",
        });
        const allImagesToDelete = [...userImages, ...placeImages, ...eventImages];
        const imageIds = allImagesToDelete.map((img) => img._id);
        await services_1.ImageService.deleteImages(imageIds);
        const eventsUpdated = await Event_1.default.updateMany({ "schedule.timeSlots.collaborators": userId }, { $pull: { "schedule.$[].timeSlots.$[].collaborators": userId } });
        logger_1.default.info(`Removed user from collaborators in ${eventsUpdated.modifiedCount} events`);
        if (placeIds.length > 0) {
            await Event_1.default.deleteMany({ place: { $in: placeIds } });
            logger_1.default.info(`Deleted events for ${placeIds.length} places of user ${userId}`);
        }
        const partnershipsDeleted = await Partnership_1.Partnership.deleteMany({
            $or: [{ initiator: userId }, { collaborator: userId }],
        });
        logger_1.default.info(`Deleted ${partnershipsDeleted.deletedCount} partnerships for user ${userId}`);
        if (placeIds.length > 0) {
            await Place_1.default.deleteMany({ _id: { $in: placeIds } });
            logger_1.default.info(`Deleted ${placeIds.length} places for user ${userId}`);
        }
        await User_1.default.findByIdAndDelete(userId);
        logger_1.default.info(`User account permanently deleted: ${userId}`);
        res.clearCookie("token");
        (0, response_1.APIResponse)(res, { imagesToDelete: imageIds }, "Account and all associated data deleted successfully. Images need to be deleted from AWS.", 200);
    }
    catch (error) {
        logger_1.default.error("Error deleting account:", error);
        (0, response_1.APIResponse)(res, null, "Server error", 500);
    }
};
exports.deleteAccount = deleteAccount;
