import type GetEventBookingsByEventUseCase from "@src/application/usecases/eventBookings/GetEventBookingsByEvent.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@src/api/http/controllerFactory";

const GetEventBookingsByEventController = (
  getEventBookingsByEventUseCase: GetEventBookingsByEventUseCase
): Controller =>
  createController({
    execute: (req) =>
      getEventBookingsByEventUseCase.execute({
        eventId: requireObjectIdParam(req, "eventId"),
        actorId: requireAuth(req).id,
      }),
    successMessage: "Réservations récupérées avec succès",
  });

export default GetEventBookingsByEventController;
