import { RequestHandler } from "express";
import {
  getEventsInViewQuerySchema,
  getEventsQuerySchema,
  newEventSchema,
  updateEventSchema,
} from "@src/api/dto/events/event.dto";
import { BaseHttpController } from "@src/api/http/BaseHttpController";
import {
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";
import type CreateEventUseCase from "@src/application/usecases/events/CreateEvent.usecase";
import type DeleteEventUseCase from "@src/application/usecases/events/DeleteEvent.usecase";
import type GetEventByIdUseCase from "@src/application/usecases/events/GetEventById.usecase";
import type GetEventsUseCase from "@src/application/usecases/events/GetEvents.usecase";
import type GetEventsInViewUseCase from "@src/application/usecases/events/GetEventsInView.usecase";
import type UpdateEventUseCase from "@src/application/usecases/events/UpdateEvent.usecase";

class EventsController extends BaseHttpController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly getEventsUseCase: GetEventsUseCase,
    private readonly getEventByIdUseCase: GetEventByIdUseCase,
    private readonly getEventsInViewUseCase: GetEventsInViewUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase
  ) {
    super();
  }

  create(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const decoded = requireAuth(req);
        const eventData = validateOrThrow(newEventSchema, req.body);
        return this.createEventUseCase.execute({
          name: eventData.name,
          description: eventData.description,
          ownerId: decoded.id,
          categoryId: eventData.eventCategory,
          schedule: eventData.schedule.map((period) => ({
            startDate: period.startDate,
            endDate: period.endDate,
            timeSlots: period.timeSlots?.map((slot) => ({
              title: slot.title,
              startTime: slot.startTime,
              endTime: slot.endTime,
              collaboratorIds: (slot.collaborators ?? []).map((c) => c.id),
            })),
          })),
          placeId: eventData.place,
          location: eventData.location,
          online: eventData.online,
          imageId: eventData.image,
          isBookable: eventData.isBookable,
          capacity: eventData.capacity,
          maxSeatsPerBooking: eventData.maxSeatsPerBooking,
        });
      },
      successMessage: "Event created successfully",
      successStatus: 201,
      mapResult: (result) => ({ id: result.id }),
    });
  }

  list(): RequestHandler {
    return this.handler({
      execute: (req) =>
        this.getEventsUseCase.execute({
          filters: validateOrThrow(getEventsQuerySchema, req.query),
        }),
      successMessage: "Events fetched successfully",
    });
  }

  getById(): RequestHandler {
    return this.handler({
      execute: (req) =>
        this.getEventByIdUseCase.execute({
          eventId: requireObjectIdParam(req, "eventId"),
        }),
      successMessage: "Event fetched successfully",
    });
  }

  getInView(): RequestHandler {
    return this.handler({
      execute: (req) => {
        const query = validateOrThrow(getEventsInViewQuerySchema, req.query);
        return this.getEventsInViewUseCase.execute({
          filters: {
            ne: query.ne,
            sw: query.sw,
            eventCategories: query.filters.eventCategories,
            startDate: query.filters.startDate,
            endDate: query.filters.endDate,
            limit: query.limit,
          },
        });
      },
      successMessage: "Events fetched successfully",
    });
  }

  update(): RequestHandler {
    return this.handler({
      execute: async (req) => {
        const eventId = requireObjectIdParam(req, "eventId");
        const updateData = validateOrThrow(updateEventSchema, req.body);
        await this.updateEventUseCase.execute({
          eventId,
          actorId: requireAuth(req).id,
          name: updateData.name,
          description: updateData.description,
          categoryId: updateData.eventCategory,
          schedule: updateData.schedule?.map((period) => ({
            startDate: period.startDate,
            endDate: period.endDate,
            timeSlots: period.timeSlots?.map((slot) => ({
              title: slot.title,
              startTime: slot.startTime,
              endTime: slot.endTime,
              collaboratorIds: (slot.collaborators ?? []).map((c) => c.id),
            })),
          })),
          placeId: updateData.place,
          location: updateData.location,
          online: updateData.online,
          imageId: updateData.image,
          isBookable: updateData.isBookable,
          capacity: updateData.capacity,
          maxSeatsPerBooking: updateData.maxSeatsPerBooking,
        });
        return { id: eventId };
      },
      successMessage: "Event updated successfully",
    });
  }

  delete(): RequestHandler {
    return this.handler({
      execute: (req) =>
        this.deleteEventUseCase.execute({
          eventId: requireObjectIdParam(req, "eventId"),
          actorId: requireAuth(req).id,
        }),
      successMessage: "Event deleted successfully",
    });
  }
}

export default EventsController;
