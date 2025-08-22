import { Response, NextFunction } from "express";
import Event from "../models/Event";
import { APIResponse } from "../utils/response";
import { CustomRequest } from "../types/custom";

const eventOwnership = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const placeId = req.placeId;
    const { eventId } = req.params;

    if (!eventId) {
      APIResponse(res, null, "Event ID is required", 400);
      return;
    }

    const event = await Event.findById(eventId).select("place");
    if (!event) {
      APIResponse(res, null, "Event not found", 404);
      return;
    }

    if (event.place.toString() !== placeId) {
      APIResponse(res, null, "You can't update this event", 403);
      return;
    }

    next();
  } catch (error) {
    APIResponse(res, null, "Failed to verify event ownership", 500);
  }
};

export default eventOwnership;
