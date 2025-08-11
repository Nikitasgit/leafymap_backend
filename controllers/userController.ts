import { Request, Response } from "express";
import User from "../models/User";
import Place, { ICollaborator, IPlace } from "../models/Place";
import Event from "../models/Event";
import { generateSignedUrlFromFullUrl } from "../types/s3";
import { CustomRequest } from "../types/custom";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { generateToken, setTokenCookie } from "../utils/jwt";
import mongoose from "mongoose";
import {
  addCreatorSchema,
  updateCreatorSchema,
  findCreatorsQuerySchema,
  getUserInPlacesAndEventsQuerySchema,
} from "../validations/userValidation";
import { addOrganizerSchema } from "../validations/placeValidations";

const getUserById = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
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

const addCreator = async (req: CustomRequest, res: Response): Promise<void> => {
  const parseResult = addCreatorSchema.safeParse(req.body);
  if (!parseResult.success) {
    APIResponse(res, null, "Validation error", 400);
    return;
  }
  const data = parseResult.data;
  console.log("parsed data", parseResult);
  try {
    const {
      name,
      description,
      category,
      placeCategory,
      location,
      defaultSchedule,
      placeActive,
      phone,
      placeType,
      email,
      website,
    } = data;
    const user = await User.findById(req.user?.id).select("_id userType");
    if (!user) {
      APIResponse(res, null, "User not found", 404);
      return;
    }
    if (user.userType !== "guest") {
      APIResponse(res, null, "User has already an updated profile", 400);
      return;
    }
    if (phone) {
      const existingUserWithPhone = await User.findOne({
        phone,
        _id: { $ne: req.user?.id },
      });
      if (existingUserWithPhone) {
        APIResponse(
          res,
          null,
          "Ce numéro de téléphone est déjà utilisé par un autre utilisateur",
          400
        );
        return;
      }
    }
    if (email) {
      const existingUserWithEmail = await User.findOne({
        email,
        _id: { $ne: req.user?.id },
      });
      if (existingUserWithEmail) {
        APIResponse(
          res,
          null,
          "Cet email est déjà utilisé par un autre utilisateur",
          400
        );
        return;
      }
    }

    user.userType = "creator";
    user.description = description || user.description;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.website = website || user.website;
    user.creatorProfile = {
      name,
      categories: [new mongoose.Types.ObjectId(category)],
    };

    let place = null;

    if (placeActive) {
      place = new Place({
        name: name || user.username,
        description,
        userId: user._id,
        location: location,
        placeType: placeType || ["art"],
        isCreatorPlace: true,
        placeCategory: placeCategory,
        defaultSchedule: defaultSchedule || {},
      });
      await place.save();
      user.creatorProfile.place = place._id;
    }

    await user.save();

    const newToken = generateToken({
      id: user._id.toString(),
      userType: user.userType,
    });
    setTokenCookie(res, newToken);

    APIResponse(
      res,
      { user, place },
      "Creator profile added successfully",
      201
    );
  } catch (err: any) {
    logger.error("Error adding creator:", err);
    APIResponse(res, null, "Server error", 500);
  }
};

const addOrganizer = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const parseResult = addOrganizerSchema.safeParse(req.body);
  if (!parseResult.success) {
    APIResponse(res, parseResult.error.errors, "Validation error", 400);
    return;
  }
  const data = parseResult.data;
  try {
    const {
      name,
      description,
      placeCategory,
      placeType,
      location,
      defaultSchedule,
      phone,
      email,
      website,
      collaborators,
      createdCollaborators,
    } = data;

    const user = await User.findById(req.user?.id).select(
      "_id userType places"
    );
    if (!user) {
      APIResponse(res, null, "User not found", 404);
      return;
    }
    if (user.userType !== "guest") {
      APIResponse(res, null, "User can not be an organizer", 400);
      return;
    }

    if (!location) {
      APIResponse(res, null, "Location is required", 400);
      return;
    }

    user.userType = "organizer";

    const place = new Place({
      name: name,
      description,
      userId: user._id,
      phone,
      email,
      website,
      location,
      placeCategory,
      placeType,
      defaultSchedule,
      collaborators: collaborators?.map((collab: any) => ({
        userId: collab._id,
        status: collab.status,
      })),
      createdCollaborators,
    });
    await place.save();
    user.places.push(place._id);

    await user.save();

    const newToken = generateToken({
      id: user._id.toString(),
      userType: user.userType,
    });
    setTokenCookie(res, newToken);

    APIResponse(
      res,
      { user, place },
      "Organizer profile added successfully",
      201
    );
  } catch (err: any) {
    logger.error("Error adding organizer:", err);
    APIResponse(res, null, "Server error", 500);
  }
};

const updateCreator = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const parseResult = updateCreatorSchema.safeParse(req.body);
  if (!parseResult.success) {
    APIResponse(res, null, "Validation error", 400);
    return;
  }
  const data = parseResult.data;
  try {
    const {
      name,
      description,
      category,
      placeCategory,
      location,
      defaultSchedule,
      phone,
      email,
      website,
      placeActive,
      placeType,
    } = data;

    const user = await User.findById(req.user?.id);
    if (!user) {
      APIResponse(res, null, "User not found", 404);
      return;
    }
    if (user.userType !== "creator") {
      APIResponse(res, null, "User is not a creator", 400);
      return;
    }

    if (phone && phone !== user.phone) {
      const existingUserWithPhone = await User.findOne({
        phone,
        _id: { $ne: req.user?.id },
      });
      if (existingUserWithPhone) {
        APIResponse(
          res,
          null,
          "Ce numéro de téléphone est déjà utilisé par un autre utilisateur",
          400
        );
        return;
      }
    }

    if (email && email !== user.email) {
      const existingUserWithEmail = await User.findOne({
        email,
        _id: { $ne: req.user?.id },
      });
      if (existingUserWithEmail) {
        APIResponse(
          res,
          null,
          "Cet email est déjà utilisé par un autre utilisateur",
          400
        );
        return;
      }
    }

    user.description = description || user.description;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.website = website || user.website;

    if (!user.creatorProfile) {
      user.creatorProfile = { name: "", categories: [] };
    }
    user.creatorProfile.name = name || user.creatorProfile.name;
    if (category) {
      user.creatorProfile.categories = [new mongoose.Types.ObjectId(category)];
    }
    let place = null;
    if (user.creatorProfile.place) {
      place = await Place.findById(user.creatorProfile.place);
      if (!place) {
        APIResponse(res, null, "Place not found", 404);
        return;
      }
      if (!placeActive) {
        place.active = false;
      } else {
        place.name = name || place.name;
        place.active = true;
        place.placeType = placeType || place.placeType || ["art"];
        place.description = description || place.description;
        place.placeCategory = new mongoose.Types.ObjectId(placeCategory);
        if (location) {
          place.location = location;
        }
        place.defaultSchedule = defaultSchedule || place.defaultSchedule;
      }
      await place.save();
    } else if (location) {
      place = new Place({
        name: name || user.creatorProfile.name,
        userId: user._id,
        location: location,
        isCreatorPlace: true,
        placeCategory,
        placeType: placeType || ["art"],
        defaultSchedule: defaultSchedule || {},
      });
      await place.save();
      user.creatorProfile.place = place._id;
    }

    await user.save();

    APIResponse(
      res,
      { user, place },
      "Creator profile updated successfully",
      200
    );
  } catch (err: any) {
    logger.error("Error updating creator:", err);
    APIResponse(res, null, "Server error", 500);
  }
};

const findCreators = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  const parseResult = findCreatorsQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    APIResponse(res, null, "Validation error", 400);
    return;
  }
  const query = parseResult.data;
  try {
    const { name, limit = 10 } = query;
    const queryFilter: any = {};
    const user = await User.findById(req.user?._id);
    if (user?.userType === "creator") {
      queryFilter._id = { $ne: req.user?._id };
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
  const parseResult = getUserInPlacesAndEventsQuerySchema.safeParse(req.query);
  if (!parseResult.success) {
    APIResponse(res, null, "Validation error", 400);
    return;
  }
  const query = parseResult.data;
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
      "collaborators.userId": { $in: user._id },
      "collaborators.status": "accepted",
      status: { $in: ["upcoming", "ongoing"] },
    })
      .select("_id name placeId image")
      .lean();

    const eventPlaceIds = userEvents
      .map((event) => event.placeId)
      .filter(Boolean);

    const allPlaces = await Place.find({
      $and: [
        { active: true },
        {
          $or: [
            {
              "collaborators.userId": { $in: user._id },
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
      if (event.placeId) {
        const placeId = event.placeId.toString();
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

export {
  getUserById,
  addCreator,
  addOrganizer,
  updateCreator,
  findCreators,
  getUserInPlacesAndEvents,
};
