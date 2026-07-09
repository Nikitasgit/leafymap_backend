import { updateEventBookingSchema } from "@/validations/eventBooking.validations";
import { IUpdateEventBookingAction } from "@/actions/eventBookings";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
  validateOrThrow,
} from "@/utils/controllerFactory";

const UpdateEventBookingController = (
  updateEventBookingAction: IUpdateEventBookingAction
): Controller =>
  createController({
    execute: async (req) => {
      const bookingId = requireObjectIdParam(req, "bookingId");
      const { seats } = validateOrThrow(updateEventBookingSchema, req.body);
      await updateEventBookingAction.execute({
        bookingId,
        requesterId: requireAuth(req).id,
        seats,
      });
      return { _id: bookingId };
    },
    successMessage: "Réservation modifiée avec succès",
  });

export default UpdateEventBookingController;
