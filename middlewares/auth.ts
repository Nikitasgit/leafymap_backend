import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { CustomRequest } from "types/custom";

export interface IDecodedToken {
  id: string;
  userType: string;
  iat: number;
  exp: number;
}

const auth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
      return;
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as IDecodedToken;

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }
    const userExists = await User.exists({ _id: decoded.id });
    
    if (!userExists) {
      res.status(401).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    req.decoded = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

export default auth;
