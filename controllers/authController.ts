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
} from "../validations/authValidations";
import { generateSignedUrlFromFullUrl } from "../utils/s3";
import { CustomRequest } from "types/custom";
import { IPlace } from "types/models";

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = validateRegisterData(req.body);

    if (!validatedData.isValid) {
      APIResponse(res, validatedData.errors, "Validation failed", 400);
      return;
    }

    const { email, password, username } = req.body;

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
    if (error instanceof Error) {
      APIResponse(res, null, `Failed to register: ${error.message}`, 500);
    } else {
      APIResponse(res, null, "Failed to register", 500);
    }
    logger.error("Error in register:", error);
  }
};

const signIn = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = validateLoginData(req.body);
    if (!validatedData.isValid) {
      APIResponse(res, validatedData.errors, "Validation failed", 400);
      return;
    }
    const { identifier, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      APIResponse(res, null, "Les identifiants sont incorrects", 401);
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
    if (error instanceof Error) {
      APIResponse(res, null, `Failed to sign in: ${error.message}`, 500);
    } else {
      APIResponse(res, null, "Failed to sign in", 500);
    }
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
        path: "image",
        model: "Image",
        select: "url",
      })
      .populate({
        path: "places",
        model: "Place",
        populate: {
          path: "image",
          model: "Image",
          select: "url",
        },
      })
      .lean();

    if (!user) {
      APIResponse(res, null, "User not found", 404);
      return;
    }
    if (user.places) {
      await Promise.all(
        (user.places as IPlace[]).map(async (place) => {
          if (
            place.image &&
            typeof place.image === "object" &&
            "url" in place.image
          ) {
            place.image.url = await generateSignedUrlFromFullUrl(
              place.image.url
            );
          }
        })
      );
    }

    if (user.image && typeof user.image === "object" && "url" in user.image) {
      user.image.url = await generateSignedUrlFromFullUrl(user.image.url);
    }

    APIResponse(
      res,
      {
        user,
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
