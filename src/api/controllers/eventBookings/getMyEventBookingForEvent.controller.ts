import { IGetMyEventBookingForEventUseCase } from "@src/application/usecases/eventBookings/GetMyEventBookingForEvent.usecase";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const GetMyEventBookingForEventController = (
  getMyEventBookingForEventUseCase: IGetMyEventBookingForEventUseCase
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
