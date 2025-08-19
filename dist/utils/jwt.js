"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTokenCookie = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
/**
 * Generates a JWT token for a user
 * @param payload - The payload to include in the token
 * @returns The generated JWT token
 */
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
        expiresIn: "1d",
    });
};
exports.generateToken = generateToken;
/**
 * Sets the JWT token as an HTTP-only cookie
 * @param res - Express response object
 * @param token - The JWT token to set
 */
const setTokenCookie = (res, token) => {
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400000, // 1 day
    });
};
exports.setTokenCookie = setTokenCookie;
