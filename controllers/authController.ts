import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { generateToken, setTokenCookie } from "../utils/jwt";
import {
  validateRegisterData,
  validateLoginData,
  getValidationErrors,
} from "../validations/authValidations";
import { generateSignedUrlFromFullUrl } from "../utils/s3";
import { z } from "zod";
import { CustomRequest } from "types/custom";

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = validateRegisterData(req.body);
    const { email, password, username } = validatedData;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      APIResponse(res, null, "Email already exists", 400);
      return;
    }
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      APIResponse(res, null, "Username already exists", 400);
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashed, username });

    APIResponse(res, null, "User registered", 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = getValidationErrors(error);
      const errorMessage = Object.values(validationErrors).join(", ");
      APIResponse(res, null, errorMessage, 400);
      return;
    }
    APIResponse(res, null, "Server error", 500);
    logger.error("Error in register:", error);
  }
};

const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = validateLoginData(req.body);
    const { identifier, password } = validatedData;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      APIResponse(res, null, "Invalid credentials", 401);
      return;
    }
    const userWithoutPassword = await User.findById(user._id).select(
      "email username"
    );
    const token = generateToken({
      id: user._id.toString(),
      userType: user.userType,
    });
    setTokenCookie(res, token);
    APIResponse(res, { user: userWithoutPassword }, "Logged in", 200);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = getValidationErrors(error);
      const errorMessage = Object.values(validationErrors).join(", ");
      APIResponse(res, null, errorMessage, 400);
      return;
    }
    APIResponse(res, null, "Server error", 500);
    logger.error("Error in signIn:", error);
  }
};

const signOut = async (_req: Request, res: Response): Promise<void> => {
  res
    .clearCookie("token")
    .clearCookie("userType")
    .json({ message: "Logged out" });
};

const verifyToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies.token;

    if (!token) {
      APIResponse(res, null, "No token provided", 401);
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "") as any;
    const user = await User.findById(decoded.id);

    if (!user) {
      APIResponse(res, null, "User not found", 401);
      return;
    }

    APIResponse(
      res,
      {
        user: {
          id: user._id,
          userType: user.userType,
          username: user.username,
          email: user.email,
        },
      },
      "Token verified",
      200
    );
  } catch (error) {
    APIResponse(res, null, "Invalid token", 401);
    logger.error("Error in verifyToken:", error);
  }
};
const getAuthUser = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const decoded = req.decoded!;
    const user = await User.findById(decoded.id).select("email username");
    APIResponse(res, user, "User retrieved successfully", 200);
  } catch (error) {
    APIResponse(res, null, "Server error", 500);
    logger.error("Error in getAuthUser:", error);
  }
};
const getCurrentUser = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const decoded = req.decoded!;
    const user = await User.findById(decoded.id)
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
      APIResponse(res, null, "User not found", 404);
      return;
    }

    let signedImageUrl = null;
    if (user.image) {
      try {
        signedImageUrl = await generateSignedUrlFromFullUrl(user.image);
      } catch (error) {
        logger.error("Error generating signed URL for user image:", error);
      }
    }

    const userWithSignedImage = {
      ...user.toObject(),
      image: signedImageUrl || user.image,
    };

    APIResponse(
      res,
      {
        user: userWithSignedImage,
      },
      "User retrieved successfully",
      200
    );
  } catch (error) {
    APIResponse(res, null, "Server error", 500);
    logger.error("Error in getCurrentUser:", error);
  }
};

export { register, signIn, signOut, verifyToken, getAuthUser, getCurrentUser };
