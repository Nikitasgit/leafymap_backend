import { Request, Response } from "express";
import { parseJson } from "../utils/jsonHandlers";
import Place from "../models/Place";
import User from "../models/User";
import Event from "../models/Event";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { enrichScheduleWithEvents } from "../utils/schedule";
import { CustomRequest } from "../types/custom";
import { validatePlaceData } from "../validations/placeValidations";
import { ImageService } from "../services";
import Image from "../models/Image";
import { Partnership } from "../models/Partnership";

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
    const user = await User.findById(decoded.id).select("creatorName places");
    if (!user) {
      APIResponse(res, null, "User not found", 404);
      return;
    }
    if (user.places.length === 1 && decoded.userType === "creator") {
      APIResponse(res, null, "Creator already have a place", 400);
    }
    if (user.places.length === 3 && decoded.userType === "organizer") {
      APIResponse(res, null, "Organizer already have 3 places", 400);
    }
    if (decoded.userType === "creator") {
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
        select: "urls",
      })
      .populate({
        path: "user",
        model: "User",
        select: "creatorCategories description",
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

    if (
      place.isCreatorPlace &&
      typeof place.user === "object" &&
      "description" in place.user
    ) {
      place.description = place.user.description;
    }

    if (enrichSchedule === "true") {
      const events = await Event.find({
        place: placeId,
        status: { $ne: "cancelled" },
      })
        .select("name schedule")
        .lean();

      const enrichedSchedule = enrichScheduleWithEvents(
        place.defaultSchedule,
        events.map((event) => ({
          ...event,
          _id: event._id.toString(),
        }))
      );
      place.defaultSchedule = enrichedSchedule;
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

    const places = await Place.find(query)
      .select("location placeCategory isCreatorPlace name")
      .populate({
        path: "placeCategory",
        model: "PlaceCategory",
      })
      .limit(queryLimit)
      .lean();

    APIResponse(res, places, "Places fetched successfully", 200);
  } catch (error) {
    logger.error("Error fetching places in view:", error);
    APIResponse(res, null, "Failed to fetch places in view", 500);
  }
};

const searchPlaces = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, categoryId, limit = "10" } = req.query;

    const maxLimit = 20;
    const queryLimit = Math.min(parseInt(limit as string), maxLimit);

    interface PlaceSearchQuery {
      active: boolean;
      deleted: boolean;
      name?: { $regex: string; $options: string };
      placeCategory?: string;
    }

    interface SortOptions {
      [key: string]: 1 | -1;
    }

    const baseQuery: PlaceSearchQuery = {
      active: true,
      deleted: false,
    };
    let sortOptions: SortOptions = {};

    if (name && (name as string).length >= 3) {
      baseQuery.name = { $regex: name as string, $options: "i" };
    } else if (categoryId && !name) {
      baseQuery.placeCategory = categoryId as string;
      sortOptions = { createdAt: -1 };
    } else if (!name && !categoryId) {
      sortOptions = { createdAt: -1 };
    } else if (name && (name as string).length < 3) {
      APIResponse(res, [], "Search query must be at least 3 characters", 200);
      return;
    }
    const places = await Place.find(baseQuery)
      .select(
        "_id name location.label image placeCategory createdAt description isCreatorPlace user"
      )
      .populate({
        path: "placeCategory",
        model: "PlaceCategory",
        select: "name",
      })
      .populate({
        path: "user",
        model: "User",
        select: "_id",
      })
      .populate({
        path: "image",
        model: "Image",
        select: "urls",
      })
      .sort(sortOptions)
      .limit(queryLimit)
      .lean();

    let message = "Places retrieved successfully";
    if (name) {
      message = "Places searched successfully";
    } else if (categoryId) {
      message = "Places by category retrieved successfully";
    } else {
      message = "Latest places retrieved successfully";
    }

    APIResponse(res, places, message, 200);
  } catch (error) {
    logger.error("Error searching places:", error);
    APIResponse(res, null, "Failed to search places", 500);
  }
};

const deletePlace = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const placeId = req.placeId;
    const decoded = req.decoded!;

    const placeEvents = await Event.find({ place: placeId });
    const eventIds = placeEvents.map((event) => event._id);

    const eventsImages = await Image.find({
      reference: { $in: eventIds },
      referenceType: "Event",
    });
    const placeImages = await Image.find({
      reference: placeId,
      referenceType: "Place",
    });

    const allImagesToDelete = [...eventsImages, ...placeImages];
    const imageIds = allImagesToDelete.map((img) => img._id);

    await ImageService.deleteImages(imageIds);
    await Place.findByIdAndDelete(placeId);
    await Event.deleteMany({ place: placeId });
    await Partnership.deleteMany({ place: placeId });
    await User.findByIdAndUpdate(decoded.id, {
      $pull: { places: placeId },
    });

    APIResponse(
      res,
      null,
      "Place and associated events deleted successfully",
      200
    );
  } catch (error) {
    logger.error("Error deleting place:", error);
    APIResponse(res, null, "Failed to delete place", 500);
  }
};

export {
  updatePlace,
  createPlace,
  getPlaceById,
  getPlacesInView,
  searchPlaces,
  deletePlace,
};
