"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const auth = async (req, res, next) => {
    var _a;
    try {
        const token = req.cookies.token || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]);
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Not authorized to access this route",
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "");
        if (!decoded) {
            res.status(401).json({
                success: false,
                message: "Invalid token",
            });
            return;
        }
        const userExists = await User_1.default.exists({ _id: decoded.id });
        if (!userExists) {
            res.status(401).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        req.decoded = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Not authorized to access this route",
        });
    }
};
exports.default = auth;
