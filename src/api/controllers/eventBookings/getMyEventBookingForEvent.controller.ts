import type GetMyEventBookingForEventUseCase from "@src/application/usecases/eventBookings/GetMyEventBookingForEvent.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const GetMyEventBookingForEventController = (
  getMyEventBookingForEventUseCase: GetMyEventBookingForEventUseCase
): Controller =>
  createController({
    execute: (req) =>
      getMyEventBookingForEventUseCase.execute({
        eventId: requireObjectIdParam(req, "eventId"),
        userId: requireAuth(req).id,
      }),
    successMessage: "Réservation récupérée avec succès",
  });

export default GetMyEventBookingForEventController;
