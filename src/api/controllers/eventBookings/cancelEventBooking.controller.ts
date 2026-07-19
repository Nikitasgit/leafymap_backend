import type CancelEventBookingUseCase from "@src/application/usecases/eventBookings/CancelEventBooking.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const CancelEventBookingController = (
  cancelEventBookingUseCase: CancelEventBookingUseCase
): Controller =>
  createController({
    execute: (req) =>
      cancelEventBookingUseCase.execute({
        bookingId: requireObjectIdParam(req, "bookingId"),
        requesterId: requireAuth(req).id,
      }),
    successMessage: "Réservation annulée avec succès",
  });

export default CancelEventBookingController;
