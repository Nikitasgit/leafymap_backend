import { ICancelEventBookingUseCase } from "@src/application/usecases/eventBookings/CancelEventBooking.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const CancelEventBookingController = (
  cancelEventBookingUseCase: ICancelEventBookingUseCase
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
