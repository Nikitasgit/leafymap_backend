"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnershipsByUserId = exports.getPartnerships = exports.updatePartnerships = exports.createPartnerships = void 0;
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const Partnership_1 = require("../models/Partnership");
const eventDates_1 = require("../utils/eventDates");
const mongoose_1 = __importDefault(require("mongoose"));
const createPartnerships = async (req, res) => {
    try {
        const decoded = req.decoded;
        const { placeId, eventId } = req.params;
        const { partnerships } = req.body;
        const createPromises = partnerships.map(async (partnership) => {
            const existingPartnership = await Partnership_1.Partnership.findOne({
                place: placeId,
                event: eventId,
                collaborator: partnership.collaborator._id,
            });
            if (existingPartnership) {
                return existingPartnership;
            }
            const newPartnership = new Partnership_1.Partnership({
                place: placeId,
                event: eventId,
                initiator: decoded.id,
                collaborator: partnership.collaborator._id,
                type: eventId ? "event" : "place",
            });
            return await newPartnership.save();
        });
        const createdPartnerships = await Promise.all(createPromises);
        (0, response_1.APIResponse)(res, createdPartnerships, "Partnerships created successfully", 201);
    }
    catch (error) {
        logger_1.default.error("Error creating partnership:", error);
        (0, response_1.APIResponse)(res, null, "Failed to create partnership", 500);
    }
};
exports.createPartnerships = createPartnerships;
const updatePartnerships = async (req, res) => {
    try {
        const decoded = req.decoded;
        const { partnerships } = req.body;
        const updatePromises = partnerships.map(async (partnership) => {
            const existingPartnership = await Partnership_1.Partnership.findById(partnership._id);
            if (!existingPartnership) {
                throw new Error(`Partnership ${partnership._id} not found`);
            }
            const isInitiator = existingPartnership.initiator.toString() === decoded.id;
            const isCollaborator = existingPartnership.collaborator.toString() === decoded.id;
            let updateData = {};
            if (isInitiator) {
                updateData.deleted = partnership.deleted;
            }
            else if (isCollaborator) {
                if (partnership.status) {
                    updateData.status = partnership.status;
                }
            }
            else {
                throw new Error("You don't have permission to update this partnership");
            }
            return await Partnership_1.Partnership.findByIdAndUpdate(partnership._id, updateData, {
                new: true,
            });
        });
        await Promise.all(updatePromises);
        (0, response_1.APIResponse)(res, null, "Partnerships updated successfully", 200);
    }
    catch (error) {
        logger_1.default.error("Error updating partnership:", error);
        (0, response_1.APIResponse)(res, null, "Failed to update partnership", 500);
    }
};
exports.updatePartnerships = updatePartnerships;
// get partnerships by place id or event id
const getPartnerships = async (req, res) => {
    try {
        const { placeId, eventId } = req.params;
        const type = req.query.type;
        const partnerships = await Partnership_1.Partnership.find({
            place: placeId,
            event: eventId,
            type,
        })
            .populate({
            path: "collaborator",
            select: "creatorName creatorCategories image deleted",
            model: "User",
            populate: {
                path: "image",
                model: "Image",
                select: "url",
            },
        })
            .select("collaborator status deleted")
            .lean();
        const transformedPartnerships = await Promise.all(partnerships.map(async (partnership) => {
            const collaborator = partnership.collaborator;
            if (collaborator.deleted) {
                return null;
            }
            return {
                ...partnership,
                collaborator: {
                    _id: collaborator._id,
                    name: collaborator.creatorName,
                    categories: collaborator.creatorCategories,
                    image: collaborator.image,
                    deleted: collaborator.deleted,
                },
            };
        }));
        (0, response_1.APIResponse)(res, transformedPartnerships, "Partnerships rieved successfully", 200);
    }
    catch (error) {
        logger_1.default.error("Error getting partnerships by place id:", error);
        (0, response_1.APIResponse)(res, null, "Failed to get partnerships by place id", 500);
    }
};
exports.getPartnerships = getPartnerships;
const getPartnershipsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { asCollaborator, includeCancelledEvents, includePastEvents } = req.query;
        const isCollaborator = asCollaborator === "true";
        const query = isCollaborator
            ? { collaborator: new mongoose_1.default.Types.ObjectId(userId) }
            : { initiator: new mongoose_1.default.Types.ObjectId(userId) };
        let eventPopulateQuery = {
            path: "event",
            select: "name description image schedule status",
            populate: {
                path: "image",
                model: "Image",
                select: "urls",
            },
        };
        if (includeCancelledEvents !== "true") {
            eventPopulateQuery.match = { status: { $ne: "cancelled" } };
        }
        const partnerships = await Partnership_1.Partnership.find({ ...query, deleted: false })
            .populate("initiator", "firstName lastName email")
            .populate("collaborator", "firstName lastName email")
            .populate({
            path: "place",
            match: {
                deleted: { $ne: true },
                active: { $ne: false },
            },
            select: "name address image location active deleted",
            populate: {
                path: "image",
                model: "Image",
                select: "urls",
            },
        })
            .populate({
            path: "event",
            match: includeCancelledEvents !== "true"
                ? { status: { $ne: "cancelled" } }
                : {},
            select: "name description image schedule status",
            populate: {
                path: "image",
                model: "Image",
                select: "urls",
            },
        })
            .lean();
        const validPartnerships = partnerships.filter((partnership) => {
            if (partnership.place === null) {
                return false;
            }
            if (partnership.type === "event" && partnership.event === null) {
                return false;
            }
            return true;
        });
        let filteredPartnerships = validPartnerships;
        if (includePastEvents !== "true") {
            filteredPartnerships = filteredPartnerships.filter((partnership) => {
                if (!partnership.event) {
                    return true;
                }
                const event = partnership.event;
                const eventStatusResult = (0, eventDates_1.getEventStatusFromSchedule)(event.schedule);
                return (eventStatusResult === "ongoing" || eventStatusResult === "upcoming");
            });
        }
        (0, response_1.APIResponse)(res, filteredPartnerships, "Partnerships retrieved successfully", 200);
    }
    catch (error) {
        logger_1.default.error("Error getting partnerships by user id:", error);
        (0, response_1.APIResponse)(res, null, "Failed to get partnerships by user id", 500);
    }
};
exports.getPartnershipsByUserId = getPartnershipsByUserId;
