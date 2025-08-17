import { Request, Response } from "express";
import Event from "../models/Event";
import User from "../models/User";
import mongoose from "mongoose";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import { CustomRequest } from "../types/custom";
import { generateSignedUrlFromFullUrl } from "../types/s3";
import { IEvent } from "types/models/event";
import { IEventPeriod } from "types/models/event";

const createEvent = async (
  req: CustomRequest,
  res: Response
): Promise<void> => {
  try {
    const placeId = req.placeId;

    const { name, description, schedule } = req.body;

    if (!name || !description || !schedule) {
      APIResponse(
        res,
        null,
        "Name, description, and schedule are required",
        400
      );
      return;
    }

    const eventData: any = {
      name,
      description,
      schedule,
      place: new mongoose.Types.ObjectId(placeId),
      status: "upcoming",
    };

    const event = await Event.create(eventData);

    APIResponse(res, event, "Event created successfully", 201);
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

    const { name, description, schedule, status } = req.body;

    const transformedSchedule: IEventPeriod[] = schedule.map((period: any) => ({
      startDate: new Date(period.startDate),
      endDate: new Date(period.endDate),
      timeSlots: (period.timeSlots || []).map((slot: any) => ({
        title: slot.title || "",
        startTime: slot.startTime || "",
        endTime: slot.endTime || "",
        collaborators: slot.collaborators.map((collaborator: any) => ({
          _id: new mongoose.Types.ObjectId(collaborator._id),
        })),
      })),
    }));

    if (transformedSchedule.length === 0) {
      APIResponse(res, null, "Schedule must contain at least one period", 400);
      return;
    }

    // Validate that each period has valid dates
    for (const period of transformedSchedule) {
      if (!period.startDate || !period.endDate) {
        APIResponse(
          res,
          null,
          "Each schedule period must have valid dates",
          400
        );
        return;
      }
    }

    const updateData: Partial<IEvent> = {
      name,
      description,
      schedule: transformedSchedule,
    };

    if (status) {
      updateData.status = status;
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
    if (error instanceof Error) {
      APIResponse(res, null, `Failed to update event: ${error.message}`, 500);
    } else {
      APIResponse(res, null, "Failed to update event", 500);
    }
    logger.error("Error updating event:", error);
  }
};

export { updateEvent, createEvent, getEventsByPlaceId, getEventById };
