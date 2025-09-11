import { Request, Response } from "express";
import User from "../models/User";
import { CustomRequest } from "../types/custom";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { generateToken, setTokenCookie } from "../utils/jwt";
import { validateNewUserData } from "../validations/userValidations";

const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId)
      .where("deleted", false)
      .select("-password -createdAt -updatedAt -interests  -deleted -__v")
      .populate({
        path: "creatorCategories",
        model: "SubCategory",
      })
      .populate({
        path: "image",
        model: "Image",
        select: "urls",
      })
      .populate({
        path: "places",
        model: "Place",
        populate: {
          path: "image",
          model: "Image",
          select: "urls",
        },
      });

    if (!user) {
      APIResponse(res, null, "User not found", 404);
      return;
    }

    APIResponse(res, { user }, "User fetched successfully", 200);
  } catch (err) {
    logger.error("Error getting user:", err);
    APIResponse(res, null, "Server error", 500);
  }
};

const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { creatorName, limit = 10 } = req.query;
    const queryFilter: any = {};
    if (creatorName) {
      queryFilter["creatorName"] = { $regex: creatorName, $options: "i" };
    }

    const users = await User.find(queryFilter)
      .where("deleted", false)
      .select(
        "-password -createdAt -updatedAt -interests -deleted -__v -email -username -userType -phone -website -description -country -address"
      )
      .populate({
        path: "image",
        model: "Image",
        select: "urls",
      })
      .populate({
        path: "creatorCategories",
        model: "SubCategory",
        select: "name",
      })
      .limit(parseInt(limit as string))
      .lean();

    APIResponse(res, users, "Users fetched successfully", 200);
  } catch (err) {
    logger.error("Error finding users:", err);
    APIResponse(res, null, "Server error", 500);
  }
};

const updateUser = async (req: CustomRequest, res: Response): Promise<void> => {
  const validationResult = validateNewUserData(req.body);

  if (!validationResult.isValid) {
    APIResponse(res, validationResult.errors, "Validation error", 400);
    return;
  }

  try {
    const decoded = req.decoded!;
    const userUpdated = await User.findByIdAndUpdate(decoded.id, req.body, {
      new: true,
    });
    if (!userUpdated) {
      APIResponse(res, null, "User not found", 404);
      return;
    }
    const newToken = generateToken({
      id: userUpdated._id.toString(),
      userType: userUpdated.userType,
    });
    setTokenCookie(res, newToken);
    APIResponse(res, null, "User updated successfully", 200);
  } catch (error) {
    logger.error("Error updating user:", error);
    APIResponse(res, null, "Server error", 500);
  }
};

const deleteAccount = async (
  req: CustomRequest,   
  res: Response
): Promise<void> => {
  try {
    const decoded = req.decoded!;
    const userId = decoded.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { deleted: true },
      { new: true }
    );

    if (!user) {
      APIResponse(res, null, "User not found", 404);
      return;
    }

    // Optionnel: Supprimer aussi les données associées
    // await Place.updateMany({ user: userId }, { deleted: true });
    // await Event.updateMany({ user: userId }, { deleted: true });
    // etc.

    logger.info(`User account deleted: ${userId}`);
    APIResponse(res, null, "Account deleted successfully", 200);
  } catch (error) {
    logger.error("Error deleting account:", error);
    APIResponse(res, null, "Server error", 500);
  }
};

export { getUserById, getUsers, updateUser, deleteAccount };
