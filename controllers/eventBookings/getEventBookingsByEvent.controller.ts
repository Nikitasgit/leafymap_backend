import { IGetEventBookingsByEventAction } from "@/actions/eventBookings";
import {
  Controller,
  createController,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const GetEventBookingsByEventController = (
  getEventBookingsByEventAction: IGetEventBookingsByEventAction
): Controller =>
  createController({
    execute: (req) =>
      getEventBookingsByEventAction.execute({
        eventId: requireObjectIdParam(req, "eventId"),
      }),
    successMessage: "Réservations récupérées avec succès",
  });

export default GetEventBookingsByEventController;
