import { updateEventBookingSchema } from "@src/api/dto/eventBookings/eventBooking.dto";
import { IUpdateEventBookingUseCase } from "@src/application/usecases/eventBookings/UpdateEventBooking.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const UpdateEventBookingController = (
  updateEventBookingUseCase: IUpdateEventBookingUseCase
): Controller =>
  createController({
    execute: (req) => {
      const bookingData = validateOrThrow(updateEventBookingSchema, req.body);
      return updateEventBookingUseCase.execute({
        bookingId: requireObjectIdParam(req, "bookingId"),
        requesterId: requireAuth(req).id,
        seats: bookingData.seats,
      });
    },
    successMessage: "Réservation mise à jour avec succès",
  });

export default UpdateEventBookingController;
