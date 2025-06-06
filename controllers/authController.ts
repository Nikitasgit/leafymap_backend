import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET as string;

const register = async (req: Request, res: Response): Promise<void> => {
  const { email, password, username } = req.body;
  try {
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
  } catch (err) {
    APIResponse(res, null, "Server error", 500);
    logger.error("Error in register:", err);
  }
};

const signIn = async (req: Request, res: Response): Promise<void> => {
  const { identifier, password } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      APIResponse(res, null, "Invalid credentials", 401);
      return;
    }

    const token = jwt.sign(
      {
        id: user._id,
        userType: user.userType,
      },
      JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400000, // 1 day
      })
      .cookie("logged_in", "true", {
        httpOnly: false, // readable from JavaScript
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 86400000,
      })
      .json({ message: "Logged in", user });
  } catch (err) {
    APIResponse(res, null, "Server error", 500);
    logger.error("Error in signIn:", err);
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
