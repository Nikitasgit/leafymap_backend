import { IGetMyEventBookingsAction } from "@/actions/eventBookings";
import { Controller, createController, requireAuth } from "@/utils/controllerFactory";

const GetMyEventBookingsController = (
  getMyEventBookingsAction: IGetMyEventBookingsAction
): Controller =>
  createController({
    execute: (req) =>
      getMyEventBookingsAction.execute({
        userId: requireAuth(req).id,
      }),
    successMessage: "Réservations récupérées avec succès",
  });

export default GetMyEventBookingsController;
