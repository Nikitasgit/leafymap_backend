import { createEventBookingSchema } from "@src/api/dto/eventBookings/eventBooking.dto";
import { ICreateEventBookingUseCase } from "@src/application/usecases/eventBookings/CreateEventBooking.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const CreateEventBookingController = (
  createEventBookingUseCase: ICreateEventBookingUseCase
): Controller =>
  createController({
    execute: (req) => {
      const bookingData = validateOrThrow(createEventBookingSchema, req.body);
      return createEventBookingUseCase.execute({
        eventId: requireObjectIdParam(req, "eventId"),
        userId: requireAuth(req).id,
        seats: bookingData.seats,
      });
    },
    successMessage: "Réservation créée avec succès",
    successStatus: 201,
    mapResult: (result) => ({ _id: result.id }),
  });

export default CreateEventBookingController;
