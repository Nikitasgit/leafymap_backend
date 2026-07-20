import { asClass, AwilixContainer } from "awilix";
import NotificationsController from "@src/api/controllers/NotificationsController";
import GetCurrentUserNotificationsUseCase from "@src/application/usecases/notifications/GetCurrentUserNotifications.usecase";
import MarkAllNotificationsAsReadUseCase from "@src/application/usecases/notifications/MarkAllNotificationsAsRead.usecase";
import MarkNotificationsAsReadUseCase from "@src/application/usecases/notifications/MarkNotificationsAsRead.usecase";
import type { Cradle } from "@src/di/cradle";

export const registerNotificationsModule = (
  container: AwilixContainer<Cradle>
): void => {
  container.register({
    getCurrentUserNotificationsUseCase: asClass(
      GetCurrentUserNotificationsUseCase
    ).singleton(),
    markNotificationsAsReadUseCase: asClass(
      MarkNotificationsAsReadUseCase
    ).singleton(),
    markAllNotificationsAsReadUseCase: asClass(
      MarkAllNotificationsAsReadUseCase
    ).singleton(),

    notificationsController: asClass(NotificationsController).singleton(),
  });
};
