import { IGetMyEventBookingsUseCase } from "@src/application/usecases/eventBookings/GetMyEventBookings.usecase";
import {
  Controller,
  createController,
  requireAuth,
} from "@/utils/controllerFactory";

const GetMyEventBookingsController = (
  getMyEventBookingsUseCase: IGetMyEventBookingsUseCase
): Controller =>
  createController({
    execute: (req) =>
      getMyEventBookingsUseCase.execute({
        userId: requireAuth(req).id,
      }),
    successMessage: "Réservations récupérées avec succès",
  });

export default GetMyEventBookingsController;
