import { newEventSchema } from "@src/api/dto/events/event.dto";
import { ICreateEventUseCase } from "@src/application/usecases/events/CreateEvent.usecase";
import {
  Controller,
  createController,
  requireAuth,
  validateOrThrow,
} from "@/utils/controllerFactory";

const CreateEventController = (
  createEventUseCase: ICreateEventUseCase
): Controller =>
  createController({
    execute: (req) => {
      const decoded = requireAuth(req);
      const body = { ...req.body };
      if (req.placeId) {
        body.place = req.placeId;
      }
      const eventData = validateOrThrow(newEventSchema, body);
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
