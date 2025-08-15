import { Request, Response } from "express";
import Event from "../models/Event";
import User from "../models/User";
import mongoose from "mongoose";
import { APIResponse } from "../utils/response";
import logger from "../utils/logger";
import Place from "../models/Place";
import { CustomRequest } from "../types/custom";
import { generateSignedUrlFromFullUrl } from "../types/s3";
import { IEvent } from "types/models/event";
import { IEventPeriod } from "types/models/event";

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
    if (place.user.toString() !== user.id.toString()) {
      APIResponse(res, null, "You can't create an event for this place", 400);
      return;
    }

    const { name, description, schedule, collaborators } = req.body;

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
      collaborators,
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
        path: "collaborators.user",
        model: "User",
        select: "_id username image",
      },
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

        // Process top-level collaborators
        if (eventObj.collaborators) {
          eventObj.collaborators = await Promise.all(
            eventObj.collaborators.map(async (collaborator: any) => {
              if (collaborator._id && collaborator._id.image) {
                collaborator._id.image = await generateSignedUrlFromFullUrl(
                  collaborator._id.image
                );
              }
              return collaborator;
            })
          );
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
      .populate([
        {
          path: "collaborators.user",
          model: "User",
          select: "_id creatorProfile image",
        },
        {
          path: "schedule.timeSlots.collaborators.user",
          model: "User",
          select: "_id creatorProfile image",
        },
      ])
      .lean();

    if (!event) {
      APIResponse(res, null, "Event not found", 404);
      return;
    }

    if (event.image) {
      event.image = await generateSignedUrlFromFullUrl(event.image);
    }

    if (event.collaborators) {
      event.collaborators = (await Promise.all(
        event.collaborators.map(async (collaborator: any) => {
          const transformedCollaborator = {
            _id: collaborator._id._id,
            status: collaborator.status,
            name: collaborator._id.creatorProfile?.name || "",
            image: collaborator._id.image || "",
          };
          if (transformedCollaborator.image) {
            transformedCollaborator.image = await generateSignedUrlFromFullUrl(
              transformedCollaborator.image
            );
          }
          return transformedCollaborator;
        })
      )) as any;
    }

    // Transform collaborators in timeSlots
    if (event.schedule) {
      event.schedule = await Promise.all(
        event.schedule.map(async (period: any) => {
          if (period.timeSlots) {
            period.timeSlots = await Promise.all(
              period.timeSlots.map(async (slot: any) => {
                if (slot.collaborators) {
                  slot.collaborators = await Promise.all(
                    slot.collaborators.map(async (collaborator: any) => {
                      const transformedCollaborator = {
                        _id: collaborator._id._id,
                        status: collaborator.status,
                        name: collaborator._id.creatorProfile?.name || "",
                        image: collaborator._id.image || "",
                      };
                      if (transformedCollaborator.image) {
                        transformedCollaborator.image =
                          await generateSignedUrlFromFullUrl(
                            transformedCollaborator.image
                          );
                      }
                      return transformedCollaborator;
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
    if (place.user.toString() !== user.id.toString()) {
      APIResponse(res, null, "You can't update this event", 400);
      return;
    }

    const { name, description, schedule, collaborators, status } = req.body;

    const transformedSchedule: IEventPeriod[] = schedule.map((period: any) => ({
      startDate: new Date(period.startDate),
      endDate: new Date(period.endDate),
      timeSlots: (period.timeSlots || []).map((slot: any) => ({
        title: slot.title || "",
        startTime: slot.startTime || "",
        endTime: slot.endTime || "",
        collaborators: (slot.collaborators || []).map((collaborator: any) => ({
          _id: new mongoose.Types.ObjectId(collaborator._id || collaborator),
          status: collaborator.status || "pending",
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

    const transformedCollaborators = (collaborators || []).map(
      (collaborator: any) => ({
        _id: new mongoose.Types.ObjectId(collaborator._id || collaborator),
        status: collaborator.status || "pending",
      })
    );

    const updateData: Partial<IEvent> = {
      name,
      description,
      schedule: transformedSchedule,
      collaborators: transformedCollaborators,
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
