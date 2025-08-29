import { Request, Response } from "express";
import { parseJson } from "../utils/jsonHandlers";
import Place from "../models/Place";
import User from "../models/User";
import Event from "../models/Event";
import { generateSignedUrlFromFullUrl } from "../utils/s3";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { enrichScheduleWithEvents } from "../utils/schedule";
import { CustomRequest } from "../types/custom";
import { validatePlaceData } from "../validations/placeValidations";

const updatePlace = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const placeId = req.placeId;
    const decoded = req.decoded!;

    if (decoded.userType === "creator") {
      const user = await User.findById(decoded.id).select(
        "creatorName creatorCategories"
      );
      if (!user) {
        APIResponse(res, null, "User not found", 404);
        return;
      }
      req.body.isCreatorPlace = true;
      req.body.name = user.creatorName;
    }

    const validationResult = validatePlaceData(
      req.body,
      decoded.userType as "creator" | "organizer",
      true
    );

    if (!validationResult.isValid) {
      APIResponse(res, validationResult.errors, "Validation failed", 400);
      return;
    }

    const place = await Place.findByIdAndUpdate(placeId, req.body);

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
    const decoded = req.decoded!;
    if (!["creator", "organizer"].includes(decoded.userType)) {
      APIResponse(
        res,
        null,
        "Only creators and organizers can create places",
        403
      );
      return;
    }

    if (decoded.userType === "creator") {
      const user = await User.findById(decoded.id).select("creatorName");
      if (!user) {
        APIResponse(res, null, "User not found", 404);
        return;
      }
      req.body.isCreatorPlace = true;
      req.body.name = user.creatorName;
    }
    req.body.user = decoded.id;

    const validationResult = validatePlaceData(
      req.body,
      decoded.userType as "creator" | "organizer"
    );

    if (!validationResult.isValid) {
      APIResponse(res, validationResult.errors, "Validation failed", 400);
      return;
    }

    const place = await Place.create(req.body);

    await User.findByIdAndUpdate(decoded.id, {
      $push: { places: place._id },
    });

    APIResponse(res, place._id, "Place created successfully", 201);
  } catch (error) {
    logger.error("Error creating place:", error);
    APIResponse(res, null, "Failed to create place", 500);
  }
};

const getPlaceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { placeId } = req.params;
    const { enrichSchedule = "true" } = req.query;

    let place = await Place.findById(placeId)
      .populate({
        path: "placeCategory",
        model: "PlaceCategory",
      })
      .populate({
        path: "image",
        model: "Image",
        select: "url",
      })
      .populate({
        path: "user",
        model: "User",
        select: "creatorCategories",
        populate: {
          path: "creatorCategories",
          model: "SubCategory",
        },
      })
      .lean();
    if (!place) {
      APIResponse(res, null, "Place not found", 404);
      return;
    }

    if (enrichSchedule === "true") {
      const events = await Event.find({
        place: placeId,
        status: { $in: ["upcoming", "ongoing"] },
      }).select("name schedule");

      const formattedEvents = events.map((event) => ({
        _id: event._id.toString(),
        name: event.name,
        schedule: event.schedule.map((period) => ({
          startDate: period.startDate,
          endDate: period.endDate,
        })),
      }));
      const enrichedSchedule = enrichScheduleWithEvents(
        place.defaultSchedule,
        formattedEvents
      );
      place.defaultSchedule = enrichedSchedule;
    }

    if (
      place.image &&
      typeof place.image === "object" &&
      "url" in place.image
    ) {
      place.image.url = await generateSignedUrlFromFullUrl(place.image.url);
    }

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
      .populate({
        path: "image",
        model: "Image",
        select: "url",
      })
      .limit(queryLimit)
      .lean();

    const placesWithSignedUrls = await Promise.all(
      places.map(async (place) => {
        if (
          place.image &&
          typeof place.image === "object" &&
          "url" in place.image
        ) {
          place.image.url = await generateSignedUrlFromFullUrl(place.image.url);
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
