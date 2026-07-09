import { createEventBookingSchema } from "@/validations/eventBooking.validations";
import { ICreateEventBookingAction } from "@/actions/eventBookings";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const CreateEventBookingController = (
  createEventBookingAction: ICreateEventBookingAction
): Controller =>
  createController({
    execute: (req) => {
      const bookingData = validateOrThrow(createEventBookingSchema, req.body);
      return createEventBookingAction.execute({
        eventId: requireObjectIdParam(req, "eventId"),
        userId: requireAuth(req).id,
        seats: bookingData.seats,
      });
    },
    successMessage: "Réservation créée avec succès",
    successStatus: 201,
  });

export default CreateEventBookingController;
