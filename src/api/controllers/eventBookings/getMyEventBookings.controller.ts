import type GetMyEventBookingsUseCase from "@src/application/usecases/eventBookings/GetMyEventBookings.usecase";
import {
  Controller,
  createController,
  requireAuth,
} from "@src/api/http/controllerFactory";

const GetMyEventBookingsController = (
  getMyEventBookingsUseCase: GetMyEventBookingsUseCase
): Controller =>
  createController({
    execute: (req) =>
      getMyEventBookingsUseCase.execute({
        userId: requireAuth(req).id,
      }),
    successMessage: "Réservations récupérées avec succès",
  });

export default GetMyEventBookingsController;
