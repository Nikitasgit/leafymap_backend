import {
  ConversationRepository,
  MessageRepository,
  UserRepository,
  NotificationRepository,
} from "@/repositories";
import GetCurrentUserNotificationsAction from "@/actions/notifications/GetCurrentUserNotifications.action";
import MarkNotificationsAsReadAction from "@/actions/notifications/MarkNotificationsAsRead.action";
import MarkAllNotificationsAsReadAction from "@/actions/notifications/MarkAllNotificationsAsRead.action";
import GetCurrentUserNotificationsController from "@/controllers/notifications/getCurrentUserNotifications.controller";
import MarkNotificationsAsReadController from "@/controllers/notifications/markNotificationsAsRead.controller";
import MarkAllNotificationsAsReadController from "@/controllers/notifications/markAllNotificationsAsRead.controller";
import { AuthMiddleware } from "@/middlewares";
import NotificationService from "@/services/notificationService";

const conversationRepository = new ConversationRepository();
const messageRepository = new MessageRepository();
const notificationRepository = new NotificationRepository();
const userRepository = new UserRepository();

export const notificationService = new NotificationService(
  conversationRepository,
  messageRepository,
  notificationRepository
);

export const authMiddleware = new AuthMiddleware(userRepository);

const getCurrentUserNotificationsAction = new GetCurrentUserNotificationsAction(
  notificationService
);
const markNotificationsAsReadAction = new MarkNotificationsAsReadAction(
  notificationService
);
const markAllNotificationsAsReadAction = new MarkAllNotificationsAsReadAction(
  notificationService
);

export const getCurrentUserNotifications =
  new GetCurrentUserNotificationsController(getCurrentUserNotificationsAction);
export const markNotificationsAsRead = new MarkNotificationsAsReadController(
  markNotificationsAsReadAction
);
export const markAllNotificationsAsRead =
  new MarkAllNotificationsAsReadController(markAllNotificationsAsReadAction);
