import { Request, Response } from "express";
import Event from "../models/Event";
import mongoose from "mongoose";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { CustomRequest } from "../types/custom";
import { validateEventData } from "../validations/eventValidations";
import { format } from "date-fns";
import { Partnership } from "../models/Partnership";
import Image from "../models/Image";

const createEvent = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const placeId = req.placeId;
    const validationResult = validateEventData(req.body, false);
    if (!validationResult.isValid) {
      APIResponse(res, validationResult.errors, "Validation failed", 400);
      return;
    }
    req.body.place = new mongoose.Types.ObjectId(placeId);
    const event = await Event.create(req.body);

    APIResponse(res, event._id, "Event created successfully", 201);
  } catch (error) {
    if (error instanceof Error) {
      APIResponse(res, null, `Failed to create event: ${error.message}`, 500);
    } else {
      APIResponse(res, null, "Failed to create event", 500);
    }
    logger.error("Error creating event:", error);
  }
};

const getEventsByPlaceId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { placeId } = req.params;
    if (!placeId) {
      APIResponse(res, null, "Place ID is required", 400);
      return;
    }
    const events = await Event.find({
      place: new mongoose.Types.ObjectId(placeId),
    })
      .select("name image place description status schedule")
      .populate({ path: "image", model: "Image", select: "_id urls" })
      .populate({ path: "place", model: "Place", select: "_id name" })
      .lean();

    APIResponse(res, events, "Events fetched successfully", 200);
  } catch (error) {
    APIResponse(res, null, "Failed to fetch events", 500);
    logger.error("Error fetching events:", error);
  }
};

const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId)
      .populate({
        path: "place",
        model: "Place",
        select: "_id location image name",
        populate: {
          path: "image",
          model: "Image",
          select: "urls",
        },
      })
      .populate({ path: "image", model: "Image", select: "_id urls" })
      .populate({
        path: "schedule.timeSlots.collaborators",
        model: "User",
        select: "_id creatorName image",
        populate: {
          path: "image",
          model: "Image",
        },
      })
      .lean();

    if (!event) {
      APIResponse(res, null, "Event not found", 404);
      return;
    }

    // Transform collaborator data structure for frontend consumption
    const updatedEvent = {
      ...event,
      schedule: event.schedule.map((period) => ({
        ...period,
        timeSlots: period.timeSlots.map((slot) => ({
          ...slot,
          collaborators: slot.collaborators.map((collaborator: any) => ({
            name: collaborator.creatorName,
            image: collaborator.image.urls.thumbnail,
            _id: collaborator._id,
          })),
        })),
      })),
    };

    APIResponse(res, updatedEvent, "Event fetched successfully", 200);
  } catch (error) {
    APIResponse(res, null, "Failed to fetch event", 500);
    logger.error("Error fetching event:", error);
  }
};

const updateEvent = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      APIResponse(res, null, "Event ID is required", 400);
      return;
    }
    const validationResult = validateEventData(req.body, true);
    if (!validationResult.isValid) {
      APIResponse(res, validationResult.errors, "Validation failed", 400);
      return;
    }

    const event = await Event.findByIdAndUpdate(eventId, req.body, {
      new: true,
    });

    if (!event) {
      APIResponse(res, null, "Event not found", 404);
      return;
    }

    APIResponse(res, event._id, "Event updated successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      APIResponse(res, null, `Failed to update event: ${error.message}`, 500);
    } else {
      APIResponse(res, null, "Failed to update event", 500);
    }
    logger.error("Error updating event:", error);
  }
};

const deleteEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    if (!eventId) {
      APIResponse(res, null, "Event ID is required", 400);
      return;
    }

    await Event.findByIdAndDelete(eventId);

    await Image.deleteMany({
      reference: eventId,
      referenceType: "Event",
    });

    await Partnership.deleteMany({ event: eventId });

    APIResponse(res, null, "Event deleted successfully", 200);
  } catch (error) {
    if (error instanceof Error) {
      APIResponse(res, null, `Failed to delete event: ${error.message}`, 500);
    } else {
      APIResponse(res, null, "Failed to delete event", 500);
    }
    logger.error("Error deleting event:", error);
  }
};

export {
  updateEvent,
  createEvent,
  getEventsByPlaceId,
  getEventById,
  deleteEvent,
};
