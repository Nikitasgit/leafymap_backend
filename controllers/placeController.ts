import { Request, Response } from "express";
import { parseJson, parseLocation } from "../helpers/userHelpers";
import Place, { IPlace } from "../models/Place";
import User from "../models/User";
import Event from "../models/Event";
import { generateSignedUrlFromFullUrl } from "../types/s3";
import mongoose from "mongoose";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { enrichScheduleWithEvents } from "../utils/schedule";
import { CustomRequest } from "../types/custom";

const updatePlace = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      APIResponse(res, null, "User not found", 404);
      return;
    }
    const { id } = req.params;
    if (!id) {
      APIResponse(res, null, "Place ID is required", 400);
      return;
    }

    if (
      user.userType !== "organizer" &&
      !user.places.includes(new mongoose.Types.ObjectId(id))
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
      placeType,
      defaultSchedule,
      collaborators,
      createdCollaborators,
    } = req.body;

    const formattedLocation = parseLocation(location);
    const parsedDefaultSchedule = parseJson(defaultSchedule, {
      monday: { open: false, timeSlots: [] },
      tuesday: { open: false, timeSlots: [] },
      wednesday: { open: false, timeSlots: [] },
      thursday: { open: false, timeSlots: [] },
      friday: { open: false, timeSlots: [] },
      saturday: { open: false, timeSlots: [] },
      sunday: { open: false, timeSlots: [] },
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
      placeType,
      defaultSchedule: parsedDefaultSchedule,
      collaborators: parsedCollaborators,
      createdCollaborators: parsedCreatedCollaborators,
    };

    if (req.file) {
      updateData.image = req.file.location;
    }
    const place = await Place.findByIdAndUpdate(id, updateData);

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
    const { enrichSchedule = "true" } = req.query; // Default to true for backward compatibility

    let place = await Place.findById(id)
      .populate({
        path: "placeCategory",
        model: "PlaceCategory",
      })
      .populate({
        path: "collaborators.userId",
        model: "User",
        select: "-password",
      })
      .lean();

    if (!place) {
      APIResponse(res, null, "Place not found", 404);
      return;
    }

    // Only enrich schedule if explicitly requested
    if (enrichSchedule === "true") {
      // Fetch events for this place
      const events = await Event.find({
        placeId: id,
        status: { $in: ["upcoming", "ongoing"] }, // Only include active events
      }).select("name schedule");

      // Convert events to the expected format
      const formattedEvents = events.map((event) => ({
        _id: event._id.toString(),
        name: event.name,
        schedule: event.schedule.map((period) => ({
          startDate: new Date(period.startDate),
          endDate: new Date(period.endDate),
        })),
      }));

      // Enrich the default schedule with events for the current week
      const enrichedSchedule = enrichScheduleWithEvents(
        place.defaultSchedule,
        formattedEvents
      );

      // Replace the default schedule with the enriched one
      place.defaultSchedule = enrichedSchedule;
    }

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

    const { placeType, placeCategory } = parseJson(filters as string, {
      placeType: ["all"],
      placeCategory: "all",
    });

    const query: any = {
      location: {
        $geoWithin: {
          $box: [bounds.sw, bounds.ne],
        },
      },
      active: true,
    };
    if (placeType && placeType.length > 0 && !placeType.includes("all")) {
      query.placeType = { $in: placeType };
    }
    if (placeCategory && placeCategory !== "all") {
      query.placeCategory = placeCategory;
    }

    const places = await Place.find(query)
      .select("location placeCategory isCreatorPlace")
      .populate({
        path: "placeCategory",
        model: "PlaceCategory",
      })
      .limit(queryLimit)
      .lean();
    APIResponse(res, places, "Places fetched successfully", 200);
  } catch (error) {
    console.error("Error fetching places in view:", error);
    APIResponse(res, null, "Failed to fetch places in view", 500);
    logger.error("Error fetching places in view:", error);
  }
};

const getPlacesBySearch = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { searchType, search } = req.query;

    if (!searchType || !search) {
      APIResponse(
        res,
        null,
        "searchType and search parameters are required",
        400
      );
      return;
    }

    if (searchType === "members") {
      const users = await User.find({
        "creatorProfile.name": { $regex: search as string, $options: "i" },
      }).select("_id creatorProfile.name image");

      if (users.length === 0) {
        APIResponse(
          res,
          { places: [], events: [] },
          "No users found with this name",
          200
        );
        return;
      }

      const userIds = users.map((user) => user._id);

      const places = await Place.find({
        "collaborators.userId": { $in: userIds },
        "collaborators.status": "accepted",
        active: true,
      })
        .select("_id name collaborators")
        .populate({
          path: "collaborators.userId",
          model: "User",
          select: "_id creatorProfile.name image",
        })
        .lean();

      const events = await Event.find({
        "collaborators.userId": { $in: userIds },
        "collaborators.status": "accepted",
        status: { $in: ["upcoming", "ongoing"] },
      })
        .select("_id name collaborators")
        .populate({
          path: "collaborators.userId",
          model: "User",
          select: "_id creatorProfile.name image",
        })
        .lean();

      // Formater les résultats pour ne retourner que les informations essentielles
      const formattedResults = users.map((user) => {
        // Trouver les places où cet utilisateur est collaborateur
        const userPlaces = places
          .filter((place) =>
            place.collaborators.some(
              (collab: any) =>
                collab.userId._id.toString() === user._id.toString() &&
                collab.status === "accepted"
            )
          )
          .map((place) => ({
            _id: place._id,
            name: place.name,
          }));

        // Trouver les events où cet utilisateur est collaborateur
        const userEvents = events
          .filter((event) =>
            event.collaborators.some(
              (collab: any) =>
                collab.userId._id.toString() === user._id.toString() &&
                collab.status === "accepted"
            )
          )
          .map((event) => ({
            _id: event._id,
            name: event.name,
            placeId: event.placeId,
          }));

        return {
          user: {
            _id: user._id,
            name: user.creatorProfile?.name || "Unknown",
          },
          places: userPlaces,
          events: userEvents,
        };
      });

      APIResponse(
        res,
        formattedResults,
        "Search results fetched successfully",
        200
      );
    } else {
      APIResponse(res, null, "Invalid search type", 400);
    }
  } catch (error) {
    console.error("Error fetching places by search:", error);
    APIResponse(res, null, "Failed to fetch places by search", 500);
    logger.error("Error fetching places by search:", error);
  }
};
export { updatePlace, getPlaceById, getPlacesInView, getPlacesBySearch };
