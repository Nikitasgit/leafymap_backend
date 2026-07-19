import { updateEventSchema } from "@src/api/dto/events/event.dto";
import type UpdateEventUseCase from "@src/application/usecases/events/UpdateEvent.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@src/api/http/controllerFactory";

const UpdateEventController = (
  updateEventUseCase: UpdateEventUseCase
): Controller =>
  createController({
    execute: async (req) => {
      const eventId = requireObjectIdParam(req, "eventId");
      const updateData = validateOrThrow(updateEventSchema, req.body);
      await updateEventUseCase.execute({
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
            collaboratorIds: (slot.collaborators ?? []).map((c) => c._id),
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
      return { _id: eventId };
    },
    successMessage: "Event updated successfully",
  });

export default UpdateEventController;
