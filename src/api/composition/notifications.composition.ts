import GetCurrentUserNotificationsController from "@src/api/controllers/notifications/getCurrentUserNotifications.controller";
import MarkAllNotificationsAsReadController from "@src/api/controllers/notifications/markAllNotificationsAsRead.controller";
import MarkNotificationsAsReadController from "@src/api/controllers/notifications/markNotificationsAsRead.controller";
import GetCurrentUserNotificationsUseCase from "@src/application/usecases/notifications/GetCurrentUserNotifications.usecase";
import MarkAllNotificationsAsReadUseCase from "@src/application/usecases/notifications/MarkAllNotificationsAsRead.usecase";
import MarkNotificationsAsReadUseCase from "@src/application/usecases/notifications/MarkNotificationsAsRead.usecase";
import {
  authMiddleware,
  mongooseNotificationRepository,
  unreadConversationCounter,
} from "@src/di/container";

const getCurrentUserNotificationsUseCase = new GetCurrentUserNotificationsUseCase(
  mongooseNotificationRepository,
  unreadConversationCounter
);
const markNotificationsAsReadUseCase = new MarkNotificationsAsReadUseCase(
  mongooseNotificationRepository
);
const markAllNotificationsAsReadUseCase = new MarkAllNotificationsAsReadUseCase(
  mongooseNotificationRepository
);

export { authMiddleware };

export const getCurrentUserNotifications = GetCurrentUserNotificationsController(
  getCurrentUserNotificationsUseCase
);
export const markNotificationsAsRead = MarkNotificationsAsReadController(
  markNotificationsAsReadUseCase
);
export const markAllNotificationsAsRead = MarkAllNotificationsAsReadController(
  markAllNotificationsAsReadUseCase
);
