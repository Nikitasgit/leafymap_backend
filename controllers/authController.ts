import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { generateToken, setTokenCookie } from "../utils/jwt";
import {
  validateRegisterData,
  validateLoginData,
} from "../validations/authValidations";
import { CustomRequest } from "types/custom";

const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const validatedData = validateRegisterData(req.body);

    if (!validatedData.isValid) {
      APIResponse(res, validatedData.errors, "Validation failed", 400);
      return;
    }

    const { email, password, username, acceptedCGU } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      APIResponse(res, null, "Cet email est déjà utilisé", 400);
      return;
    }
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      APIResponse(res, null, "Ce nom d'utilisateur est déjà utilisé", 400);
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    await User.create({
      email,
      password: hashed,
      username,
      acceptedCGU,
      acceptedAt: new Date(),
    });

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
      APIResponse(res, null, "User not found", 404);
      return;
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

export { register, signIn, signOut, getCurrentUser };
