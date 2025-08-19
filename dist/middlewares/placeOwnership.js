"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Place_1 = __importDefault(require("../models/Place"));
const response_1 = require("../utils/response");
const placeOwnership = async (req, res, next) => {
    try {
        const placeId = req.params.placeId;
        if (!placeId) {
            (0, response_1.APIResponse)(res, null, "Place ID is required", 400);
            return;
        }
        const place = await Place_1.default.findById(placeId);
        if (!place) {
            (0, response_1.APIResponse)(res, null, "Place not found", 404);
            return;
        }
        if (place.user.toString() !== req.decoded.id) {
            (0, response_1.APIResponse)(res, null, "You don't have permission to update this place", 403);
            return;
        }
        req.placeId = placeId;
        next();
    }
    catch (error) {
        (0, response_1.APIResponse)(res, null, "Failed to verify place ownership", 500);
    }
};
exports.default = placeOwnership;
