"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPartnershipsByUserId = exports.getPartnerships = exports.updatePartnerships = exports.createPartnerships = void 0;
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const Partnership_1 = require("../models/Partnership");
const s3_1 = require("../types/s3");
const createPartnerships = async (req, res) => {
    try {
        const placeId = req.placeId;
        const eventId = req.params.eventId;
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
                initiator: req.decoded.id,
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
// organizer can update deleted field
// collaborator can update status
const updatePartnerships = async (req, res) => {
    try {
        const { partnerships } = req.body;
        const updatePromises = partnerships.map(async (partnership) => {
            const existingPartnership = await Partnership_1.Partnership.findById(partnership._id);
            if (!existingPartnership) {
                throw new Error(`Partnership ${partnership._id} not found`);
            }
            const isInitiator = existingPartnership.initiator.toString() === req.decoded.id;
            const isCollaborator = existingPartnership.collaborator.toString() === req.decoded.id;
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
        const partnerships = await Partnership_1.Partnership.find({
            $or: [{ place: placeId }, { event: eventId }],
            type: eventId ? "event" : "place",
        })
            .populate("collaborator", "creatorProfile image deleted")
            .select("collaborator status deleted")
            .lean();
        const transformedPartnerships = await Promise.all(partnerships.map(async (partnership) => {
            var _a, _b;
            const collaborator = partnership.collaborator;
            if (collaborator.deleted) {
                return null;
            }
            return {
                ...partnership,
                collaborator: {
                    _id: collaborator._id,
                    name: (_a = collaborator.creatorProfile) === null || _a === void 0 ? void 0 : _a.name,
                    categories: (_b = collaborator.creatorProfile) === null || _b === void 0 ? void 0 : _b.categories,
                    image: collaborator.image
                        ? await (0, s3_1.generateSignedUrlFromFullUrl)(collaborator.image)
                        : "",
                    deleted: collaborator.deleted,
                },
            };
        }));
        (0, response_1.APIResponse)(res, transformedPartnerships, "Partnerships retrieved successfully", 200);
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
        const partnerships = await Partnership_1.Partnership.find({
            $or: [{ initiator: userId }, { collaborator: userId }],
        })
            .populate("initiator", "firstName lastName email")
            .populate("collaborator", "firstName lastName email")
            .populate("place", "name address")
            .populate("event", "title description");
        (0, response_1.APIResponse)(res, partnerships, "Partnerships retrieved successfully", 200);
    }
    catch (error) {
        logger_1.default.error("Error getting partnerships by user id:", error);
        (0, response_1.APIResponse)(res, null, "Failed to get partnerships by user id", 500);
    }
};
exports.getPartnershipsByUserId = getPartnershipsByUserId;
