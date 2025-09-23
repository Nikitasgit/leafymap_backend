"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Partnership = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const partnershipSchema = new mongoose_1.default.Schema({
    place: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Place",
        required: true,
    },
    initiator: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    collaborator: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    event: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Event",
        required: false,
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "refused", "cancelled", "completed"],
        required: true,
        default: "pending",
    },
    type: {
        type: String,
        enum: ["place", "event"],
        required: true,
        default: "place",
    },
    deleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.Partnership = mongoose_1.default.model("Partnership", partnershipSchema);
