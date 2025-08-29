import { Request, Response } from "express";
import User from "../models/User";
import Place from "../models/Place";
import Event from "../models/Event";
import { generateSignedUrlFromFullUrl } from "../utils/s3";
import { CustomRequest } from "../types/custom";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { generateToken, setTokenCookie } from "../utils/jwt";
import { validateNewUserData } from "../validations/userValidations";
import { IPlace } from "types/models/place";
import { IImage } from "types/models/Image";

const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId)
      .select("-password -createdAt -updatedAt -interests  -deleted -__v")
      .populate({
        path: "creatorCategories",
        model: "SubCategory",
      })
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
      });

    if (!user) {
      APIResponse(res, null, "User not found", 404);
      return;
    }

    if (user?.places) {
      await Promise.all(
        (user.places as unknown as IPlace[]).map(async (place) => {
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

const findCreators = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, limit = 10 } = req.query;
    const queryFilter: any = {};
    if (name) {
      queryFilter["creatorName"] = { $regex: name, $options: "i" };
    }

    const users = await User.find(queryFilter)
      .select("-password -createdAt -updatedAt -interests  -deleted -__v")
      .populate({
        path: "image",
        model: "Image",
        select: "url",
      })
      .limit(parseInt(limit as string))
      .lean();

    for (let user of users) {
      if (user.image && typeof user.image === "object" && "url" in user.image) {
        user.image.url = await generateSignedUrlFromFullUrl(user.image.url);
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
      .select("_id creatorName image creatorCategories places")
      .populate({
        path: "creatorCategories",
        model: "SubCategory",
        select: "name",
      })
      .populate({
        path: "image",
        model: "Image",
        select: "url",
      })
      .populate({
        path: "places",
        model: "Place",
        select: "location",
        populate: {
          path: "image",
          model: "Image",
          select: "url",
        },
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

    if (user.image && typeof user.image === "object" && "url" in user.image) {
      user.image.url = await generateSignedUrlFromFullUrl(user.image.url);
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

export { getUserById, findCreators, getUserInPlacesAndEvents, updateUser };
