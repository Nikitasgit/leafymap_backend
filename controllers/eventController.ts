import { Request, Response } from "express";
import { parseJson } from "../helpers/userHelpers";
import Event, { IEvent, IEventPeriod } from "../models/Event";
import User from "../models/User";
import mongoose from "mongoose";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import Place from "../models/Place";
import { CustomRequest } from "../types/custom";
import { generateSignedUrlFromFullUrl } from "../types/s3";

const createEvent = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      APIResponse(res, null, "User not found", 404);
      return;
    }

    const { placeId } = req.params;
    if (!placeId) {
      APIResponse(res, null, "Place ID is required", 400);
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      APIResponse(res, null, "Invalid Place ID format", 400);
      return;
    }

    const place = await Place.findById(placeId);
    if (!place) {
      APIResponse(res, null, "Place not found", 404);
      return;
    }
    if (place.userId.toString() !== user.id.toString()) {
      APIResponse(res, null, "You can't create an event for this place", 400);
      return;
    }

    const { name, description, schedule, collaborators, createdCollaborators } =
      req.body;

    // Validate required fields
    if (!name || !description || !schedule) {
      APIResponse(
        res,
        null,
        "Name, description, and schedule are required",
        400
      );
      return;
    }

    const parsedSchedule: IEventPeriod[] = parseJson(schedule, []).map(
      (period: any) => ({
        startDate: new Date(period.startDate),
        endDate: new Date(period.endDate),
        timeSlots: (period.timeSlots || []).map((slot: any) => ({
          title: slot.title || "",
          startTime: slot.startTime || "",
          endTime: slot.endTime || "",
          participants: Array.isArray(slot.participants)
            ? slot.participants
                .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
                .map((id: string) => new mongoose.Types.ObjectId(id))
            : [],
        })),
      })
    );

    // Validate schedule structure
    if (parsedSchedule.length === 0) {
      APIResponse(res, null, "Schedule must contain at least one period", 400);
      return;
    }

    for (const period of parsedSchedule) {
      if (
        !period.startDate ||
        !period.endDate ||
        period.timeSlots.length === 0
      ) {
        APIResponse(
          res,
          null,
          "Each schedule period must have valid dates and at least one time slot",
          400
        );
        return;
      }
    }

    const parsedCollaborators = parseJson(collaborators, []).map(
      (id: string) => new mongoose.Types.ObjectId(id)
    );

    // Validate collaborators are valid ObjectIds
    const validCollaborators = parsedCollaborators.filter((id: any) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    // Parse createdCollaborators properly according to schema
    const parsedCreatedCollaborators = parseJson(createdCollaborators, []).map(
      (collaborator: any) => {
        const parsedCollaborator: any = {};
        if (collaborator.name) {
          parsedCollaborator.name = collaborator.name;
        }
        if (
          collaborator.category &&
          mongoose.Types.ObjectId.isValid(collaborator.category)
        ) {
          parsedCollaborator.category = new mongoose.Types.ObjectId(
            collaborator.category
          );
        }
        return parsedCollaborator;
      }
    );

    // Ensure all arrays are properly initialized
    const finalCollaborators = Array.isArray(parsedCollaborators)
      ? parsedCollaborators
      : [];
    const finalCreatedCollaborators = Array.isArray(parsedCreatedCollaborators)
      ? parsedCreatedCollaborators
      : [];

    const eventData: any = {
      name,
      description,
      schedule: parsedSchedule,
      collaborators: validCollaborators,
      createdCollaborators: finalCreatedCollaborators,
      placeId: new mongoose.Types.ObjectId(placeId),
      status: "upcoming",
    };

    // Only add image if it exists
    if (req.file) {
      eventData.image = req.file.location;
    }

    console.log(
      "Creating event with data:",
      JSON.stringify(eventData, null, 2)
    );

    const event = await Event.create(eventData);

    APIResponse(res, event, "Event created successfully", 201);
  } catch (error) {
    console.error("Error creating event:", error);
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
    const { id } = req.params;
    if (!id) {
      APIResponse(res, null, "Place ID is required", 400);
      return;
    }
    const events = await Event.find({
      placeId: new mongoose.Types.ObjectId(id),
    }).populate({
      path: "collaborators",
      model: "User",
      select: "_id username image",
    });

    const eventsWithSignedUrls = await Promise.all(
      events.map(async (event) => {
        const eventObj = event.toObject();
        if (eventObj.image) {
          eventObj.image = await generateSignedUrlFromFullUrl(eventObj.image);
        }
        if (eventObj.collaborators) {
          eventObj.collaborators = await Promise.all(
            eventObj.collaborators.map(async (collaborator: any) => {
              if (collaborator.image) {
                collaborator.image = await generateSignedUrlFromFullUrl(
                  collaborator.image
                );
              }
              return collaborator;
            })
          );
        }
        return eventObj;
      })
    );

    APIResponse(res, eventsWithSignedUrls, "Events fetched successfully", 200);
  } catch (error) {
    APIResponse(res, null, "Failed to fetch events", 500);
    logger.error("Error fetching events:", error);
  }
};

const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).populate({
      path: "collaborators",
      model: "User",
      select: "_id username image",
    });
    if (event?.image) {
      event.image = await generateSignedUrlFromFullUrl(event.image);
    }
    if (event?.collaborators) {
      event.collaborators = await Promise.all(
        event.collaborators.map(async (collaborator: any) => {
          if (collaborator.image) {
            collaborator.image = await generateSignedUrlFromFullUrl(
              collaborator.image
            );
          }
          return collaborator;
        })
      );
    }
    if (!event) {
      APIResponse(res, null, "Event not found", 404);
      return;
    }
    APIResponse(res, event, "Event fetched successfully", 200);
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
    const user = await User.findById(req.user?.id);
    if (!user) {
      APIResponse(res, null, "User not found", 404);
      return;
    }
    const { eventId, placeId } = req.params;
    if (!eventId || !placeId) {
      APIResponse(res, null, "Event ID and Place ID are required", 400);
      return;
    }
    if (!mongoose.Types.ObjectId.isValid(placeId)) {
      APIResponse(res, null, "Invalid Place ID format", 400);
      return;
    }
    const place = await Place.findById(placeId);
    if (!place) {
      APIResponse(res, null, "Place not found", 404);
      return;
    }
    if (place.userId.toString() !== user.id.toString()) {
      APIResponse(res, null, "You can't update this event", 400);
      return;
    }

    const {
      name,
      description,
      schedule,
      collaborators,
      status,
      createdCollaborators,
    } = req.body;

    const parsedSchedule: IEventPeriod[] = parseJson(schedule, []).map(
      (period: any) => ({
        startDate: new Date(period.startDate),
        endDate: new Date(period.endDate),
        timeSlots: (period.timeSlots || []).map((slot: any) => ({
          title: slot.title || "",
          startTime: slot.startTime || "",
          endTime: slot.endTime || "",
          participants: Array.isArray(slot.participants)
            ? slot.participants
                .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
                .map((id: string) => new mongoose.Types.ObjectId(id))
            : [],
        })),
      })
    );

    // Validate schedule structure
    if (parsedSchedule.length === 0) {
      APIResponse(res, null, "Schedule must contain at least one period", 400);
      return;
    }

    for (const period of parsedSchedule) {
      if (
        !period.startDate ||
        !period.endDate ||
        period.timeSlots.length === 0
      ) {
        APIResponse(
          res,
          null,
          "Each schedule period must have valid dates and at least one time slot",
          400
        );
        return;
      }
    }

    const parsedCollaborators = parseJson(collaborators, []).map(
      (id: string) => new mongoose.Types.ObjectId(id)
    );

    // Validate collaborators are valid ObjectIds
    const validCollaborators = parsedCollaborators.filter((id: any) =>
      mongoose.Types.ObjectId.isValid(id)
    );

    // Parse createdCollaborators properly according to schema
    const parsedCreatedCollaborators = parseJson(createdCollaborators, []).map(
      (collaborator: any) => {
        const parsedCollaborator: any = {};
        if (collaborator.name) {
          parsedCollaborator.name = collaborator.name;
        }
        if (
          collaborator.category &&
          mongoose.Types.ObjectId.isValid(collaborator.category)
        ) {
          parsedCollaborator.category = new mongoose.Types.ObjectId(
            collaborator.category
          );
        }
        return parsedCollaborator;
      }
    );

    // Ensure all arrays are properly initialized
    const finalCollaborators = Array.isArray(parsedCollaborators)
      ? parsedCollaborators
      : [];
    const finalCreatedCollaborators = Array.isArray(parsedCreatedCollaborators)
      ? parsedCreatedCollaborators
      : [];

    const updateData: Partial<IEvent> = {
      name,
      description,
      schedule: parsedSchedule,
      collaborators: validCollaborators,
      createdCollaborators: finalCreatedCollaborators,
    };

    if (status) {
      updateData.status = status;
    }

    if (req.file) {
      updateData.image = req.file.location;
    }

    const event = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
    });

    if (!event) {
      APIResponse(res, null, "Event not found", 404);
      return;
    }

    APIResponse(res, event, "Event updated successfully", 200);
  } catch (error) {
    console.error("Error updating event:", error);
    if (error instanceof Error) {
      APIResponse(res, null, `Failed to update event: ${error.message}`, 500);
    } else {
      APIResponse(res, null, "Failed to update event", 500);
    }
    logger.error("Error updating event:", error);
  }
};

export { updateEvent, createEvent, getEventsByPlaceId, getEventById };
