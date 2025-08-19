import { Request, Response } from "express";
import User from "../models/User";
import Place from "../models/Place";
import Event from "../models/Event";
import { generateSignedUrlFromFullUrl } from "../types/s3";
import { CustomRequest } from "../types/custom";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { generateToken, setTokenCookie } from "../utils/jwt";
import mongoose from "mongoose";
import { validateNewUserData } from "../validations/userValidation";
import { validateNewPlaceData } from "../validations/placeValidations";
import { IPlace } from "types/models/place";
import { Partnership } from "../models/Partnership";

const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId)
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

    if (user?.places) {
      await Promise.all(
        (user.places as unknown as IPlace[]).map(async (place) => {
          if (place.image) {
            place.image = await generateSignedUrlFromFullUrl(place.image);
          }
        })
      );
    }
    if (user?.image) {
      const signedUrl = await generateSignedUrlFromFullUrl(user.image);
      user.image = signedUrl;
    }

    if (user?.userType === "creator" && user?.creatorProfile?.place) {
      const place = user.creatorProfile.place as any;
      if (place?.image) {
        place.image = await generateSignedUrlFromFullUrl(place.image);
      }
    }

    APIResponse(res, { user }, "User fetched successfully", 200);
  } catch (err) {
    logger.error("Error getting user:", err);
    APIResponse(res, null, "Server error", 500);
  }
};

const findCreators = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, limit = 10 } = req.query;
    const queryFilter: any = {};
    const user = await User.findById(req.decoded.id);
    if (user?.userType === "creator") {
      queryFilter._id = { $ne: req.decoded.id };
    }
    if (name) {
      queryFilter["creatorProfile.name"] = { $regex: name, $options: "i" };
    }

    const users = await User.find(queryFilter)
      .select("creatorProfile.name image")
      .limit(parseInt(limit as string));

    for (let user of users) {
      if (user?.image) {
        user.image = await generateSignedUrlFromFullUrl(user.image);
      }
    }

    APIResponse(res, users, "Users fetched successfully", 200);
  } catch (err) {
    logger.error("Error finding users:", err);
    APIResponse(res, null, "Server error", 500);
  }
};

const getUserInPlacesAndEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parseResult = req.query;
  if (!parseResult.success) {
    APIResponse(res, null, "Validation error", 400);
    return;
  }
  const query = parseResult;
  try {
    const { userId } = query;

    if (!userId) {
      APIResponse(res, null, "userId parameter is required", 400);
      return;
    }

    const user = await User.findById(userId)
      .select(
        "_id creatorProfile.name image creatorProfile.categories creatorProfile.place"
      )
      .populate({
        path: "creatorProfile.categories",
        model: "SubCategory",
        select: "name",
      })
      .populate({
        path: "creatorProfile.place",
        model: "Place",
        select: "location",
      });

    if (!user) {
      APIResponse(res, { places: [] }, "User not found", 200);
      return;
    }
    const userEvents = await Event.find({
      "collaborators.user": { $in: user._id },
      "collaborators.status": "accepted",
      status: { $in: ["upcoming", "ongoing"] },
    })
      .select("_id name placeId image")
      .lean();

    const eventPlaceIds = userEvents
      .map((event) => event.place)
      .filter(Boolean);

    const allPlaces = await Place.find({
      $and: [
        { active: true },
        {
          $or: [
            {
              "collaborators.user": { $in: user._id },
              "collaborators.status": "accepted",
            },
            { _id: { $in: eventPlaceIds } },
          ],
        },
      ],
    })
      .select("_id name location image")
      .lean();

    const placeEventsMap = new Map();

    allPlaces.forEach((place) => {
      placeEventsMap.set(place._id.toString(), {
        place,
        events: [],
      });
    });

    userEvents.forEach((event) => {
      if (event.place) {
        const placeId = event.place.toString();
        if (placeEventsMap.has(placeId)) {
          placeEventsMap.get(placeId).events.push(event);
        }
      }
    });

    if (user?.image) {
      user.image = await generateSignedUrlFromFullUrl(user.image);
    }

    await Promise.all(
      Array.from(placeEventsMap.values()).map(async (placeData) => {
        if (placeData.place?.image) {
          placeData.place.image = await generateSignedUrlFromFullUrl(
            placeData.place.image
          );
        }

        await Promise.all(
          placeData.events.map(async (event: any) => {
            if (event?.image) {
              event.image = await generateSignedUrlFromFullUrl(event.image);
            }
          })
        );
      })
    );

    const formattedResults = {
      user,
      places: Array.from(placeEventsMap.values()),
    };

    APIResponse(
      res,
      formattedResults,
      "Search results fetched successfully",
      200
    );
  } catch (error) {
    logger.error("Error fetching places by search:", error);
    APIResponse(res, null, "Failed to fetch places by search", 500);
  }
};

const updateUser = async (req: CustomRequest, res: Response): Promise<void> => {
  const validationResult = validateNewUserData(req.body);

  if (!validationResult.isValid) {
    APIResponse(res, validationResult.errors, "Validation error", 400);
    return;
  }

  try {
    const userUpdated = await User.findByIdAndUpdate(req.decoded.id, req.body, {
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

export { getUserById, findCreators, getUserInPlacesAndEvents, updateUser };
