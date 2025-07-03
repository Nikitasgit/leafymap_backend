import { Request, Response } from "express";
import User from "../models/User";
import Place, { IPlace } from "../models/Place";
import Event from "../models/Event";
import { parseJson, parseLocation } from "../helpers/userHelpers";
import { generateSignedUrlFromFullUrl } from "../types/s3";
import { CustomRequest } from "../types/custom";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { generateToken, setTokenCookie } from "../utils/jwt";
import mongoose from "mongoose";

const getUser = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
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
      res.status(404).json({ error: "User not found" });
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

    res.status(200).json({ user });
  } catch (err) {
    console.error("Error getting user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const addCreator = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      category,
      placeCategory,
      placeType,
      location,
      defaultSchedule,
      phone,
      email,
      website,
    } = req.body;
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (user.userType !== "guest") {
      res.status(400).json({ error: "User can not be a creator" });
      return;
    }
    if (phone) {
      const existingUserWithPhone = await User.findOne({
        phone,
        _id: { $ne: req.user?.id },
      });
      if (existingUserWithPhone) {
        res.status(400).json({
          error:
            "Ce numéro de téléphone est déjà utilisé par un autre utilisateur",
        });
        return;
      }
    }
    if (email) {
      const existingUserWithEmail = await User.findOne({
        email,
        _id: { $ne: req.user?.id },
      });
      if (existingUserWithEmail) {
        res.status(400).json({
          error: "Cet email est déjà utilisé par un autre utilisateur",
        });
        return;
      }
    }

    const profilePicture = req.file ? req.file.location : null;

    const formattedLocation = parseLocation(location);

    if (location && !formattedLocation) {
      res.status(400).json({ error: "Invalid location format" });
      return;
    }
    console.log(category);

    user.userType = "creator";
    user.description = description || user.description;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.website = website || user.website;
    user.image = profilePicture || user.image;
    user.creatorProfile = {
      name,
      categories: [category],
    };
    console.log(user.creatorProfile);

    let place = null;

    if (formattedLocation) {
      place = new Place({
        name: name || user.username,
        description,
        userId: user._id,
        location: formattedLocation,
        isCreatorPlace: true,
        placeCategory: placeCategory,
        placeType: parseJson(placeType, ["art"]),
        defaultSchedule: parseJson(defaultSchedule, {}),
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

    res.status(201).json({
      message: "Creator profile added successfully",
      data: {
        user,
        place,
      },
    });
  } catch (err: any) {
    console.error("Error adding creator:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const addOrganizer = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
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
    } = req.body;

    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (user.userType !== "guest") {
      res.status(400).json({ error: "User can not be an organizer" });
      return;
    }

    const profilePicture = req.file ? req.file.location : null;

    const formattedLocation = parseLocation(location);

    if (!location && !formattedLocation) {
      res.status(400).json({ error: "Invalid location format" });
      return;
    }

    user.userType = "organizer";
    let place = null;
    if (formattedLocation) {
      place = new Place({
        name: name,
        description,
        userId: user._id,
        phone,
        email,
        website,
        image: profilePicture,
        location: formattedLocation,
        isCreatorPlace: false,
        placeCategory,
        placeType: parseJson(placeType, ["art"]),
        defaultSchedule: parseJson(defaultSchedule, {}),
        collaborators: parseJson(collaborators, []).map((id: string) => ({
          userId: id,
          status: "pending",
        })),
        createdCollaborators: parseJson(createdCollaborators, []),
      });
      await place.save();
      user.places.push(place._id);
    }

    await user.save();

    const newToken = generateToken({
      id: user._id.toString(),
      userType: user.userType,
    });
    setTokenCookie(res, newToken);

    res.status(201).json({
      message: "Organizer profile added successfully",
      data: {
        user,
        place,
      },
    });
  } catch (err: any) {
    console.error("Error adding creator:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const updateCreator = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      name,
      description,
      category,
      placeCategory,
      placeType,
      location,
      defaultSchedule,
      phone,
      email,
      website,
      placeActive,
    } = req.body;

    const placeActiveBoolean = placeActive === "true";
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

    const profilePicture = req.file ? req.file.location : null;

    const formattedLocation = location ? parseLocation(location) : null;
    if (location && !formattedLocation) {
      APIResponse(res, null, "Invalid location format", 400);
      return;
    }
    user.description = description || user.description;
    user.phone = phone || user.phone;
    user.email = email || user.email;
    user.website = website || user.website;
    user.image = profilePicture || user.image;

    if (!user.creatorProfile) {
      user.creatorProfile = { name: "", categories: [] };
    }
    user.creatorProfile.name = name || user.creatorProfile.name;
    if (category) {
      user.creatorProfile.categories = [category];
    }
    let place = null;
    if (user.creatorProfile.place) {
      place = await Place.findById(user.creatorProfile.place);
      if (!place) {
        APIResponse(res, null, "Place not found", 404);
        return;
      }
      if (!placeActiveBoolean) {
        place.active = false;
      } else {
        place.name = name || place.name;
        place.active = true;
        place.description = description || place.description;
        place.placeCategory = placeCategory || place.placeCategory;
        place.placeType = parseJson(placeType, place.placeType);
        if (formattedLocation) {
          place.location = { ...formattedLocation, type: "Point" };
        }
        place.defaultSchedule = defaultSchedule
          ? parseJson(defaultSchedule, place.defaultSchedule)
          : place.defaultSchedule;
      }
      await place.save();
    } else if (formattedLocation) {
      place = new Place({
        name: name || user.creatorProfile.name,
        userId: user._id,
        location: formattedLocation,
        isCreatorPlace: true,
        placeCategory,
        placeType: parseJson(placeType, ["art"]),
        defaultSchedule: parseJson(defaultSchedule, {}),
      });
      await place.save();
      user.creatorProfile.place = place._id;
    }

    await user.save();

    res.status(200).json({
      message: "Creator profile updated successfully",
      data: { user, place },
    });
  } catch (err: any) {
    console.error("Error updating creator:", err);
    APIResponse(res, null, "Server error", 500);
  }
};

const findCreators = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, limit = 10 } = req.query;
    const query: any = {};

    if (name) {
      query["creatorProfile.name"] = { $regex: name, $options: "i" };
    }

    const users = await User.find(query)
      .select("creatorProfile.name image")
      .limit(parseInt(limit as string));

    for (let user of users) {
      if (user?.image) {
        user.image = await generateSignedUrlFromFullUrl(user.image);
      }
    }

    APIResponse(res, users, "Users fetched successfully", 200);
  } catch (err) {
    console.error("Error finding users:", err);
    APIResponse(res, null, "Server error", 500);
  }
};

const getUserInPlacesAndEvents = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.query;

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
    console.error("Error fetching places by search:", error);
    APIResponse(res, null, "Failed to fetch places by search", 500);
    logger.error("Error fetching places by search:", error);
  }
};

export {
  getUser,
  addCreator,
  addOrganizer,
  updateCreator,
  findCreators,
  getUserInPlacesAndEvents,
};
