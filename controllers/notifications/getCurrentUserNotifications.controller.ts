import { IGetCurrentUserNotificationsAction } from "@/actions/notifications";
import { Controller, createController, requireAuth } from "@/utils/controllerFactory";

const GetCurrentUserNotificationsController = (
  getCurrentUserNotificationsAction: IGetCurrentUserNotificationsAction
): Controller =>
  createController({
    execute: (req) =>
      getCurrentUserNotificationsAction.execute({
        userId: requireAuth(req).id,
      }),
    successMessage: "Notifications récupérées avec succès",
  });

export default GetCurrentUserNotificationsController;
