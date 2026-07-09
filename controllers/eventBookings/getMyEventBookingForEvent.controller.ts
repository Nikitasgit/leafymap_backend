import { IGetMyEventBookingForEventAction } from "@/actions/eventBookings";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const GetMyEventBookingForEventController = (
  getMyEventBookingForEventAction: IGetMyEventBookingForEventAction
): Controller =>
  createController({
    execute: (req) =>
      getMyEventBookingForEventAction.execute({
        eventId: requireObjectIdParam(req, "eventId"),
        userId: requireAuth(req).id,
      }),
    successMessage: "Réservation récupérée avec succès",
  });

export default GetMyEventBookingForEventController;
