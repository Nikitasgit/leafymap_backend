import { ICancelEventBookingAction } from "@/actions/eventBookings";
import {
  Controller,
  createController,
  requireAuth,
  requireObjectIdParam,
} from "@/utils/controllerFactory";

const CancelEventBookingController = (
  cancelEventBookingAction: ICancelEventBookingAction
): Controller =>
  createController({
    execute: async (req) => {
      await cancelEventBookingAction.execute({
        bookingId: requireObjectIdParam(req, "bookingId"),
        requesterId: requireAuth(req).id,
      });
    },
    successMessage: "Réservation annulée avec succès",
  });

export default CancelEventBookingController;
