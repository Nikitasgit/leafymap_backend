import type GetCurrentUserNotificationsUseCase from "@src/application/usecases/notifications/GetCurrentUserNotifications.usecase";
import {
  Controller,
  createController,
  requireAuth,
} from "@src/api/http/controllerFactory";

const GetCurrentUserNotificationsController = (
  getCurrentUserNotificationsUseCase: GetCurrentUserNotificationsUseCase
): Controller =>
  createController({
    execute: (req) =>
      getCurrentUserNotificationsUseCase.execute({
        userId: requireAuth(req).id,
      }),
    successMessage: "Notifications récupérées avec succès",
  });

export default GetCurrentUserNotificationsController;
