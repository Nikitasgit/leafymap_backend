import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { generateToken, setTokenCookie } from "../utils/jwt";
import {
  validateRegisterData,
  validateLoginData,
  getValidationErrors,
} from "../validations/authValidations";
import { z } from "zod";

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

    const token = generateToken({
      id: user._id.toString(),
      userType: user.userType,
    });

    setTokenCookie(res, token);
    res
      .cookie("logged_in", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400000,
      })
      .json({ message: "Logged in", user });
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
    .clearCookie("logged_in")
    .clearCookie("userType")
    .json({ message: "Logged out" });
};

export { register, signIn, signOut };
