"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.verifyToken = exports.signOut = exports.signIn = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const jwt_1 = require("../utils/jwt");
const authValidations_1 = require("../validations/authValidations");
const register = async (req, res) => {
    try {
        const validatedData = (0, authValidations_1.validateRegisterData)(req.body);
        if (!validatedData.isValid) {
            (0, response_1.APIResponse)(res, validatedData.errors, "Validation failed", 400);
            return;
        }
        const { email, password, username, acceptedCGU } = req.body;
        const emailExists = await User_1.default.findOne({ email });
        if (emailExists) {
            (0, response_1.APIResponse)(res, null, "Cet email est déjà utilisé", 400);
            return;
        }
        const usernameExists = await User_1.default.findOne({ username });
        if (usernameExists) {
            (0, response_1.APIResponse)(res, null, "Ce nom d'utilisateur est déjà utilisé", 400);
            return;
        }
        const hashed = await bcrypt_1.default.hash(password, 10);
        await User_1.default.create({
            email,
            password: hashed,
            username,
            acceptedCGU,
            acceptedAt: new Date(),
        });
        (0, response_1.APIResponse)(res, null, "User registered", 201);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, response_1.APIResponse)(res, null, `Failed to register: ${error.message}`, 500);
        }
        else {
            (0, response_1.APIResponse)(res, null, "Failed to register", 500);
        }
        logger_1.default.error("Error in register:", error);
    }
};
exports.register = register;
const signIn = async (req, res) => {
    try {
        const validatedData = (0, authValidations_1.validateLoginData)(req.body);
        if (!validatedData.isValid) {
            (0, response_1.APIResponse)(res, validatedData.errors, "Validation failed", 400);
            return;
        }
        const { identifier, password } = req.body;
        const user = await User_1.default.findOne({
            $or: [{ email: identifier }, { username: identifier }],
        });
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            (0, response_1.APIResponse)(res, null, "Les identifiants sont incorrects", 401);
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
        if (error instanceof Error) {
            (0, response_1.APIResponse)(res, null, `Failed to sign in: ${error.message}`, 500);
        }
        else {
            (0, response_1.APIResponse)(res, null, "Failed to sign in", 500);
        }
        logger_1.default.error("Error in signIn:", error);
    }
};
exports.signIn = signIn;
const signOut = async (_req, res) => {
    res
        .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    })
        .clearCookie("userType", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    })
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
const getCurrentUser = async (req, res) => {
    try {
        const decoded = req.decoded;
        const user = await User_1.default.findById(decoded.id)
            .select("-password -createdAt -updatedAt -interests  -deleted -__v")
            .populate({
            path: "image",
            model: "Image",
        })
            .populate({
            path: "places",
            model: "Place",
            populate: {
                path: "image",
                model: "Image",
                select: "urls",
            },
        })
            .populate({
            path: "creatorCategories",
            model: "SubCategory",
        })
            .lean();
        if (!user) {
            (0, response_1.APIResponse)(res, null, "User not found", 404);
            return;
        }
        (0, response_1.APIResponse)(res, {
            user,
        }, "User retrieved successfully", 200);
    }
    catch (error) {
        (0, response_1.APIResponse)(res, null, "Server error", 500);
        logger_1.default.error("Error in getCurrentUser:", error);
    }
};
exports.getCurrentUser = getCurrentUser;
