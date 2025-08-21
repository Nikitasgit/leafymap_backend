import { Request, Response } from "express";
import Event from "../models/Event";
import User from "../models/User";
import mongoose from "mongoose";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { CustomRequest } from "../types/custom";
import { generateSignedUrlFromFullUrl } from "../utils/s3";
import { IEvent } from "types/models/event";
import { IEventPeriod } from "types/models/event";
import { validateEventData } from "../validations/eventValidations";
import { format } from "date-fns";

const createEvent = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const placeId = req.placeId;
    const validationResult = validateEventData(req.body);
    if (!validationResult.isValid) {
      APIResponse(res, validationResult.errors, "Validation failed", 400);
      return;
    }
    req.body.place = new mongoose.Types.ObjectId(placeId);
    req.body.status = "upcoming";
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
    const { id } = req.params;
    if (!id) {
      APIResponse(res, null, "Place ID is required", 400);
      return;
    }
    const events = await Event.find({
      place: new mongoose.Types.ObjectId(id),
    }).populate([
      {
        path: "schedule.timeSlots.collaborators.user",
        model: "User",
        select: "_id username image",
      },
    ]);

    const eventsWithSignedUrls = await Promise.all(
      events.map(async (event) => {
        const eventObj = event.toObject();
        if (eventObj.image) {
          eventObj.image = await generateSignedUrlFromFullUrl(eventObj.image);
        }

        // Process collaborators in timeSlots
        if (eventObj.schedule) {
          eventObj.schedule = await Promise.all(
            eventObj.schedule.map(async (period: any) => {
              if (period.timeSlots) {
                period.timeSlots = await Promise.all(
                  period.timeSlots.map(async (slot: any) => {
                    if (slot.collaborators) {
                      slot.collaborators = await Promise.all(
                        slot.collaborators.map(async (collaborator: any) => {
                          if (collaborator._id && collaborator._id.image) {
                            collaborator._id.image =
                              await generateSignedUrlFromFullUrl(
                                collaborator._id.image
                              );
                          }
                          return collaborator;
                        })
                      );
                    }
                    return slot;
                  })
                );
              }
              return period;
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
    const event = await Event.findById(id)
      .populate([{ path: "place", model: "Place", select: "_id" }])
      .populate([
        {
          path: "schedule.timeSlots.collaborators",
          model: "User",
          select: "_id creatorProfile.name image",
        },
      ])
      .lean();

    if (!event) {
      APIResponse(res, null, "Event not found", 404);
      return;
    }

    const updatedEvent = {
      ...event,
      schedule: await Promise.all(
        event.schedule.map(async (period) => ({
          ...period,
          startDate: format(period.startDate, "dd-MM-yyyy"),
          endDate: period.endDate ? format(period.endDate, "dd-MM-yyyy") : "",
          timeSlots: await Promise.all(
            period.timeSlots.map(async (slot) => ({
              ...slot,
              collaborators: await Promise.all(
                slot.collaborators.map(async (collaborator: any) => ({
                  _id: collaborator._id,
                  name: collaborator.creatorProfile.name,
                  image: collaborator.image
                    ? await generateSignedUrlFromFullUrl(collaborator.image)
                    : "",
                }))
              ),
            }))
          ),
        }))
      ),
    };

    if (updatedEvent.image) {
      updatedEvent.image = await generateSignedUrlFromFullUrl(
        updatedEvent.image
      );
    }

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
    const validationResult = validateEventData(req.body);
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

export { updateEvent, createEvent, getEventsByPlaceId, getEventById };
