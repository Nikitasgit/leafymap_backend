"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.getAuthUser = exports.verifyToken = exports.signOut = exports.signIn = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const jwt_1 = require("../utils/jwt");
const authValidations_1 = require("../validations/authValidations");
const s3_1 = require("../utils/s3");
const zod_1 = require("zod");
const register = async (req, res) => {
    try {
        const validatedData = (0, authValidations_1.validateRegisterData)(req.body);
        const { email, password, username } = validatedData;
        const emailExists = await User_1.default.findOne({ email });
        if (emailExists) {
            (0, response_1.APIResponse)(res, null, "Email already exists", 400);
            return;
        }
        const usernameExists = await User_1.default.findOne({ username });
        if (usernameExists) {
            (0, response_1.APIResponse)(res, null, "Username already exists", 400);
            return;
        }
        const hashed = await bcrypt_1.default.hash(password, 10);
        await User_1.default.create({ email, password: hashed, username });
        (0, response_1.APIResponse)(res, null, "User registered", 201);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const validationErrors = (0, authValidations_1.getValidationErrors)(error);
            const errorMessage = Object.values(validationErrors).join(", ");
            (0, response_1.APIResponse)(res, null, errorMessage, 400);
            return;
        }
        (0, response_1.APIResponse)(res, null, "Server error", 500);
        logger_1.default.error("Error in register:", error);
    }
};
exports.register = register;
const signIn = async (req, res) => {
    try {
        const validatedData = (0, authValidations_1.validateLoginData)(req.body);
        const { identifier, password } = validatedData;
        const user = await User_1.default.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            (0, response_1.APIResponse)(res, null, "Invalid credentials", 401);
            return;
        }
        const userWithoutPassword = await User_1.default.findById(user._id).select("email username");
        const token = (0, jwt_1.generateToken)({
            id: user._id.toString(),
            userType: user.userType,
        });
        (0, jwt_1.setTokenCookie)(res, token);
        (0, response_1.APIResponse)(res, { user: userWithoutPassword }, "Logged in", 200);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const validationErrors = (0, authValidations_1.getValidationErrors)(error);
            const errorMessage = Object.values(validationErrors).join(", ");
            (0, response_1.APIResponse)(res, null, errorMessage, 400);
            return;
        }
        (0, response_1.APIResponse)(res, null, "Server error", 500);
        logger_1.default.error("Error in signIn:", error);
    }
};
exports.signIn = signIn;
const signOut = async (_req, res) => {
    res
        .clearCookie("token")
        .clearCookie("userType")
        .json({ message: "Logged out" });
};
exports.signOut = signOut;
const verifyToken = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            (0, response_1.APIResponse)(res, null, "No token provided", 401);
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "");
        const user = await User_1.default.findById(decoded.id);
        if (!user) {
            (0, response_1.APIResponse)(res, null, "User not found", 401);
            return;
        }
        (0, response_1.APIResponse)(res, {
            user: {
                id: user._id,
                userType: user.userType,
                username: user.username,
                email: user.email,
            },
        }, "Token verified", 200);
    }
    catch (error) {
        (0, response_1.APIResponse)(res, null, "Invalid token", 401);
        logger_1.default.error("Error in verifyToken:", error);
    }
};
exports.verifyToken = verifyToken;
const getAuthUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.decoded.id).select("email username");
        (0, response_1.APIResponse)(res, user, "User retrieved successfully", 200);
    }
    catch (error) {
        (0, response_1.APIResponse)(res, null, "Server error", 500);
        logger_1.default.error("Error in getAuthUser:", error);
    }
};
exports.getAuthUser = getAuthUser;
const getCurrentUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.decoded.id)
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
        let signedImageUrl = null;
        if (user.image) {
            try {
                signedImageUrl = await (0, s3_1.generateSignedUrlFromFullUrl)(user.image);
            }
            catch (error) {
                logger_1.default.error("Error generating signed URL for user image:", error);
            }
        }
        const userWithSignedImage = {
            ...user.toObject(),
            image: signedImageUrl || user.image,
        };
        (0, response_1.APIResponse)(res, {
            user: userWithSignedImage,
        }, "User retrieved successfully", 200);
    }
    catch (error) {
        (0, response_1.APIResponse)(res, null, "Server error", 500);
        logger_1.default.error("Error in getCurrentUser:", error);
    }
};
exports.getCurrentUser = getCurrentUser;
