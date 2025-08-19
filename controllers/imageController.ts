import { Response } from "express";
import { CustomRequest } from "../types/custom";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import User from "../models/User";
import Place from "../models/Place";
import Event from "../models/Event";
import mongoose from "mongoose";
import { generateSignedUrlFromFullUrl } from "../utils/s3";

export type EntityType = "user" | "place" | "event";

interface ProfilePictureRequest extends CustomRequest {
  body: {
    entityType: EntityType;
    entityId?: string;
  };
}

const uploadProfilePicture = async (
  req: ProfilePictureRequest,
  res: Response
): Promise<void> => {
  try {
    const decoded = req.decoded!;
    const user = await User.findById(decoded.id);
    if (!user) {
      APIResponse(res, null, "User not found", 404);
      return;
    }

    const { entityType, entityId } = req.body;

    if (!["user", "place", "event"].includes(entityType)) {
      APIResponse(res, null, "Invalid entity type", 400);
      return;
    }

    if (entityType !== "user" && !entityId) {
      APIResponse(res, null, `${entityType} ID is required`, 400);
      return;
    }

    if (!req.file || !req.file.location) {
      APIResponse(res, null, "No image file provided or invalid file", 400);
      return;
    }

    const imageUrl = req.file.location;

    switch (entityType) {
      case "user":
        await handleUserProfilePicture(user._id, imageUrl);
        break;
      case "place":
        await handlePlaceProfilePicture(user._id, entityId!, imageUrl);
        break;
      case "event":
        await handleEventProfilePicture(user._id, entityId!, imageUrl);
        break;
    }

    const signedImageUrl = await generateSignedUrlFromFullUrl(imageUrl);

    APIResponse(
      res,
      { imageUrl: signedImageUrl },
      "Profile picture uploaded successfully",
      200
    );
  } catch (error) {
    logger.error("Error uploading profile picture:", error);
    if (error instanceof Error) {
      APIResponse(
        res,
        null,
        `Failed to upload profile picture: ${error.message}`,
        500
      );
    } else {
      APIResponse(res, null, "Failed to upload profile picture", 500);
    }
  }
};

const handleUserProfilePicture = async (
  userId: string,
  imageUrl: string
): Promise<void> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.image = imageUrl;
  await user.save();
};

const handlePlaceProfilePicture = async (
  userId: string,
  placeId: string,
  imageUrl: string
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(placeId)) {
    throw new Error("Invalid Place ID format");
  }

  const place = await Place.findById(placeId);
  if (!place) {
    throw new Error("Place not found");
  }

  if (place.user.toString() !== userId) {
    throw new Error("You can only update profile pictures for your own places");
  }

  place.image = imageUrl;
  await place.save();
};

const handleEventProfilePicture = async (
  userId: string,
  eventId: string,
  imageUrl: string
): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new Error("Invalid Event ID format");
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  const place = await Place.findById(event.place);
  if (!place || place.user.toString() !== userId) {
    throw new Error(
      "You can only update profile pictures for events in your places"
    );
  }

  event.image = imageUrl;
  await event.save();
};

export { uploadProfilePicture };
