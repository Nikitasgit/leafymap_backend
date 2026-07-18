import { IGetEventBookingsByEventUseCase } from "@src/application/usecases/eventBookings/GetEventBookingsByEvent.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const GetEventBookingsByEventController = (
  getEventBookingsByEventUseCase: IGetEventBookingsByEventUseCase
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
