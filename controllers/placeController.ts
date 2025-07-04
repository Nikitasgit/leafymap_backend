import { Request, Response } from "express";
import { parseJson } from "../helpers/userHelpers";
import Place, { IPlace } from "../models/Place";
import User from "../models/User";
import Event from "../models/Event";
import { generateSignedUrlFromFullUrl } from "../types/s3";
import mongoose from "mongoose";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { enrichScheduleWithEvents } from "../utils/schedule";
import { CustomRequest } from "../types/custom";
import { updatePlaceSchema } from "../validations/placeValidations";

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

    const validationResult = updatePlaceSchema.safeParse(req.body);
    if (!validationResult.success) {
      APIResponse(res, validationResult.error.errors, "Validation failed", 400);
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
    } = validationResult.data;

    const updateData: Partial<IPlace> = {
      name,
      description,
      location: { ...location, type: "Point" as const },
      phone,
      email,
      website,
      placeCategory: new mongoose.Types.ObjectId(placeCategory),
      placeType,
      defaultSchedule,
      collaborators: collaborators?.map((id: string) => ({
        userId: new mongoose.Types.ObjectId(id),
        status: "pending" as const,
      })),
      createdCollaborators: createdCollaborators?.map((collab) => ({
        name: collab.name,
        category: new mongoose.Types.ObjectId(collab.category),
      })),
    };

    const place = await Place.findByIdAndUpdate(id, updateData);

    if (!place) {
      APIResponse(res, null, "Place not found", 404);
      return;
    }

    APIResponse(res, place, "Place updated successfully", 200);
  } catch (error) {
    logger.error("Error updating place:", error);
    APIResponse(res, null, "Failed to update place", 500);
  }
};

const createPlace = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      APIResponse(res, null, "User not found", 404);
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

    const placeData: Partial<IPlace> = {
      name,
      description,
      location: { ...location, type: "Point" as const },
      phone,
      email,
      website,
      placeCategory,
      placeType,
      defaultSchedule,
      collaborators: collaborators?.map((id: string) => ({
        userId: new mongoose.Types.ObjectId(id),
        status: "pending" as const,
      })),
      createdCollaborators,
      active: true,
      deleted: false,
    };

    const place = await Place.create(placeData);

    await User.findByIdAndUpdate(user._id, {
      $push: { places: place._id },
    });

    APIResponse(res, place, "Place created successfully", 201);
  } catch (error) {
    logger.error("Error creating place:", error);
    APIResponse(res, null, "Failed to create place", 500);
  }
};

const getPlaceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { enrichSchedule = "true" } = req.query;

    let place = await Place.findById(id)
      .populate({
        path: "placeCategory",
        model: "PlaceCategory",
      })
      .populate({
        path: "collaborators.userId",
        model: "User",
        select: "creatorProfile.name creatorProfile.categories",
      })
      .lean();

    if (!place) {
      APIResponse(res, null, "Place not found", 404);
      return;
    }

    if (enrichSchedule === "true") {
      const events = await Event.find({
        placeId: id,
        status: { $in: ["upcoming", "ongoing"] },
      }).select("name schedule");

      const formattedEvents = events.map((event) => ({
        _id: event._id.toString(),
        name: event.name,
        schedule: event.schedule.map((period) => ({
          startDate: new Date(period.startDate),
          endDate: new Date(period.endDate),
        })),
      }));
      const enrichedSchedule = enrichScheduleWithEvents(
        place.defaultSchedule,
        formattedEvents
      );
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
    logger.error("Error fetching place:", error);
    APIResponse(res, null, "Server error", 500);
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

    const { placeType, placeCategories, startDate, endDate } = parseJson(
      filters as string,
      {
        placeType: "all",
        placeCategories: [],
        startDate: null,
        endDate: null,
      }
    );

    const query: any = {
      location: {
        $geoWithin: {
          $box: [bounds.sw, bounds.ne],
        },
      },
      active: true,
    };
    if (placeType && placeType !== "all") {
      if (placeType === "art-craft") {
        query.placeType = { $in: ["art", "craft"] };
      } else {
        query.placeType = placeType;
      }
    }
    if (placeCategories && placeCategories.length > 0) {
      query.placeCategory = { $in: placeCategories };
    }

    let places;
    if (startDate || endDate) {
      const aggregationPipeline = [
        { $match: query },
        {
          $lookup: {
            from: "events",
            localField: "_id",
            foreignField: "placeId",
            as: "events",
          },
        },
        {
          $match: {
            events: {
              $elemMatch: {
                status: { $in: ["upcoming", "ongoing"] },
                schedule: {
                  $elemMatch: {
                    $and: [
                      ...(startDate
                        ? [{ endDate: { $gte: new Date(startDate) } }]
                        : []),
                      ...(endDate
                        ? [{ startDate: { $lte: new Date(endDate) } }]
                        : []),
                    ],
                  },
                },
              },
            },
          },
        },
        {
          $project: {
            location: 1,
            placeCategory: 1,
            isCreatorPlace: 1,
            name: 1,
          },
        },
        {
          $lookup: {
            from: "placecategories",
            localField: "placeCategory",
            foreignField: "_id",
            as: "placeCategory",
          },
        },
        {
          $unwind: {
            path: "$placeCategory",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $limit: queryLimit },
      ];

      places = await Place.aggregate(aggregationPipeline);
    } else {
      places = await Place.find(query)
        .select("location placeCategory isCreatorPlace name")
        .populate({
          path: "placeCategory",
          model: "PlaceCategory",
        })
        .limit(queryLimit)
        .lean();
    }
    APIResponse(res, places, "Places fetched successfully", 200);
  } catch (error) {
    logger.error("Error fetching places in view:", error);
    APIResponse(res, null, "Failed to fetch places in view", 500);
  }
};

const searchPlaces = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, limit = "10" } = req.query;

    if (!name || (name as string).length < 3) {
      APIResponse(res, [], "Search query must be at least 2 characters", 200);
      return;
    }

    const maxLimit = 20;
    const queryLimit = Math.min(parseInt(limit as string), maxLimit);

    const places = await Place.find({
      name: { $regex: name as string, $options: "i" },
      active: true,
      deleted: false,
    })
      .select("_id name location.label image placeCategory")
      .populate({
        path: "placeCategory",
        model: "PlaceCategory",
        select: "name",
      })
      .limit(queryLimit)
      .lean();

    const placesWithSignedUrls = await Promise.all(
      places.map(async (place) => {
        if (place.image) {
          place.image = await generateSignedUrlFromFullUrl(place.image);
        }
        return place;
      })
    );

    APIResponse(res, placesWithSignedUrls, "Places searched successfully", 200);
  } catch (error) {
    logger.error("Error searching places:", error);
    APIResponse(res, null, "Failed to search places", 500);
  }
};

export {
  updatePlace,
  createPlace,
  getPlaceById,
  getPlacesInView,
  searchPlaces,
};
