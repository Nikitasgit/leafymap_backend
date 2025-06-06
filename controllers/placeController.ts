import { Request, Response } from "express";
import { parseJson, parseLocation } from "../helpers/userHelpers";
import Place, { IPlace } from "../models/Place";
import User, { IUser } from "../models/User";
import { generateSignedUrlFromFullUrl } from "../types/s3";
import mongoose from "mongoose";
import { S3File } from "../middlewares/uploadToS3";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";

interface AuthRequest extends Request {
  user?: IUser;
}

const updatePlace = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      APIResponse(res, null, "User not found", 404);
      return;
    }
    const { placeId } = req.params;
    if (!placeId) {
      APIResponse(res, null, "Place ID is required", 400);
      return;
    }

    if (
      user.userType !== "organizer" &&
      !user.places.includes(new mongoose.Types.ObjectId(placeId))
    ) {
      APIResponse(res, null, "You can't update this place", 400);
      return;
    }

    const {
      name,
      description,
      location,
      phone,
      email,
      website,
      placeCategory,
      defaultSchedule,
      collaborators,
      createdCollaborators,
    } = req.body;

    const formattedLocation = parseLocation(location);

    if (!formattedLocation && location) {
      APIResponse(res, null, "Invalid location format", 400);
      return;
    }

    const parsedDefaultSchedule = parseJson(defaultSchedule, {
      monday: { open: false, hours: [], timeSlots: [] },
      tuesday: { open: false, hours: [], timeSlots: [] },
      wednesday: { open: false, hours: [], timeSlots: [] },
      thursday: { open: false, hours: [], timeSlots: [] },
      friday: { open: false, hours: [], timeSlots: [] },
      saturday: { open: false, hours: [], timeSlots: [] },
      sunday: { open: false, hours: [], timeSlots: [] },
    });
    const parsedCollaborators = parseJson(collaborators, []).map(
      (id: string) => ({
        userId: new mongoose.Types.ObjectId(id),
        status: "pending" as const,
      })
    );
    const parsedCreatedCollaborators = parseJson(createdCollaborators, []);

    const updateData: Partial<IPlace> = {
      name,
      description,
      ...(formattedLocation && {
        location: { ...formattedLocation, type: "Point" as const },
      }),
      phone,
      email,
      website,
      placeCategory,
      defaultSchedule: parsedDefaultSchedule,
      collaborators: parsedCollaborators,
      createdCollaborators: parsedCreatedCollaborators,
    };

    if (req.file) {
      updateData.image = (req.file as S3File).location;
    }

    const place = await Place.findByIdAndUpdate(placeId, updateData, {
      new: true,
    });

    if (!place) {
      APIResponse(res, null, "Place not found", 404);
      return;
    }

    APIResponse(res, place, "Place updated successfully", 200);
  } catch (error) {
    console.error("Error updating place:", error);
    APIResponse(res, null, "Failed to update place", 500);
    logger.error("Error updating place:", error);
  }
};

const getPlaceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let place = await Place.findById(id)
      .populate({
        path: "categories",
        model: "SubCategory",
      })
      .populate({
        path: "placeCategory",
        model: "PlaceCategory",
      })
      .populate({
        path: "collaborators.userId",
        model: "User",
        select: "-password",
      });

    if (!place) {
      APIResponse(res, null, "Place not found", 404);
      return;
    }

    place = place.toObject();
    if (place.image) {
      place.image = await generateSignedUrlFromFullUrl(place.image);
    }
    place.collaborators = await Promise.all(
      place.collaborators.map(async (collab: any) => {
        const user = await User.findById(collab.userId);
        if (user?.image) {
          user.image = await generateSignedUrlFromFullUrl(user.image);
        }
        const { userId, ...rest } = collab;
        return { ...rest, user };
      })
    );

    APIResponse(res, place, "Place fetched successfully", 200);
  } catch (error) {
    console.error("Error fetching place:", error);
    APIResponse(res, null, "Server error", 500);
    logger.error("Error fetching place:", error);
  }
};

const getPlacesInView = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ne, sw, filters, limit } = req.query;

    if (!ne || !sw) {
      APIResponse(res, null, "Missing required coordinates", 400);
      return;
    }

    let bounds;
    try {
      bounds = {
        ne: JSON.parse(ne as string),
        sw: JSON.parse(sw as string),
      };
    } catch (error) {
      APIResponse(res, null, "Invalid coordinate format", 400);
      return;
    }

    const maxLimit = 100;
    const queryLimit = Math.min(parseInt((limit as string) || "20"), maxLimit);

    // Get places with user data populated
    const places = await Place.find({
      location: {
        $geoWithin: {
          $box: [bounds.sw, bounds.ne],
        },
      },
      active: true,
    })
      .limit(queryLimit)
      .populate("userId", "image")
      .lean();

    const enrichedPlaces = await Promise.all(
      places.map(async (place: any) => {
        if (place.isCreatorPlace && place.userId?.image) {
          return {
            ...place,
            image: await generateSignedUrlFromFullUrl(place.userId.image),
          };
        }
        return place;
      })
    );

    res.status(200).json(enrichedPlaces);
  } catch (error) {
    console.error("Error fetching places in view:", error);
    APIResponse(res, null, "Failed to fetch places in view", 500);
    logger.error("Error fetching places in view:", error);
  }
};

export { updatePlace, getPlaceById, getPlacesInView };
