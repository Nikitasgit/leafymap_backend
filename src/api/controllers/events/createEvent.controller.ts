import { newEventSchema } from "@src/api/dto/events/event.dto";
import type CreateEventUseCase from "@src/application/usecases/events/CreateEvent.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const CreateEventController = (
  createEventUseCase: CreateEventUseCase
): Controller =>
  createController({
    execute: (req) => {
      const decoded = requireAuth(req);
      const eventData = validateOrThrow(newEventSchema, req.body);
      return createEventUseCase.execute({
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
            collaboratorIds: (slot.collaborators ?? []).map((c) => c._id),
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
    mapResult: (result) => ({ _id: result.id }),
  });

export default CreateEventController;
