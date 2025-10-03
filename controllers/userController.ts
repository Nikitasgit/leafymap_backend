import { Request, Response } from "express";
import User from "../models/User";
import Place from "../models/Place";
import Event from "../models/Event";
import { Partnership } from "../models/Partnership";
import Image from "../models/Image";
import { CustomRequest } from "../types/custom";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { generateToken, setTokenCookie } from "../utils/jwt";
import { validateNewUserData } from "../validations/userValidations";
import { ImageService } from "../services";

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
    const { creatorName, limit = 10, excludeIds } = req.query;
    const queryFilter: any = {};

    if (creatorName) {
      queryFilter["creatorName"] = { $regex: creatorName, $options: "i" };
    }
    if (excludeIds) {
      const excludeArray = Array.isArray(excludeIds)
        ? excludeIds
        : [excludeIds];
      queryFilter["_id"] = { $nin: excludeArray };
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

    const user = await User.findById(userId);
    if (!user) {
      APIResponse(res, null, "User not found", 404);
      return;
    }

    const userImages = await Image.find({
      $or: [{ user: userId }, { reference: userId, referenceType: "User" }],
    });

    const userPlaces = await Place.find({ user: userId });
    const placeIds = userPlaces.map((place) => place._id);
    const userEvents = await Event.find({ place: { $in: placeIds } });
    const eventIds = userEvents.map((event) => event._id);

    const placeImages = await Image.find({
      reference: { $in: placeIds },
      referenceType: "Place",
    });
    const eventImages = await Image.find({
      reference: { $in: eventIds },
      referenceType: "Event",
    });
    const allImagesToDelete = [...userImages, ...placeImages, ...eventImages];
    const imageIds = allImagesToDelete.map((img) => img._id.toString());
    await ImageService.deleteImages(imageIds);

    const eventsUpdated = await Event.updateMany(
      { "schedule.timeSlots.collaborators": userId },
      { $pull: { "schedule.$[].timeSlots.$[].collaborators": userId } }
    );

    logger.info(
      `Removed user from collaborators in ${eventsUpdated.modifiedCount} events`
    );

    if (placeIds.length > 0) {
      await Event.deleteMany({ place: { $in: placeIds } });
      logger.info(
        `Deleted events for ${placeIds.length} places of user ${userId}`
      );
    }

    const partnershipsDeleted = await Partnership.deleteMany({
      $or: [{ initiator: userId }, { collaborator: userId }],
    });
    logger.info(
      `Deleted ${partnershipsDeleted.deletedCount} partnerships for user ${userId}`
    );

    if (placeIds.length > 0) {
      await Place.deleteMany({ _id: { $in: placeIds } });
      logger.info(`Deleted ${placeIds.length} places for user ${userId}`);
    }

    await User.findByIdAndDelete(userId);
    logger.info(`User account permanently deleted: ${userId}`);

    res.clearCookie("token");

    APIResponse(
      res,
      { imagesToDelete: imageIds },
      "Account and all associated data deleted successfully. Images need to be deleted from AWS.",
      200
    );
  } catch (error) {
    logger.error("Error deleting account:", error);
    APIResponse(res, null, "Server error", 500);
  }
};

export { getUserById, getUsers, updateUser, deleteAccount };
