import {
  ConversationRepository,
  MessageRepository,
  UserRepository,
} from "@/repositories";
import GetCurrentUserNotificationsAction from "@/actions/notifications/GetCurrentUserNotifications.action";
import GetCurrentUserNotificationsController from "@/controllers/notifications/getCurrentUserNotifications.controller";
import { AuthMiddleware } from "@/middlewares";
import NotificationService from "@/services/notificationService";


const conversationRepository = new ConversationRepository();
const messageRepository = new MessageRepository();
const userRepository = new UserRepository();


const notificationService = new NotificationService(
  conversationRepository,
  messageRepository
);


export const authMiddleware = new AuthMiddleware(userRepository);

const getCurrentUserNotificationsAction = new GetCurrentUserNotificationsAction(
  notificationService
);


export const getCurrentUserNotifications =
  new GetCurrentUserNotificationsController(getCurrentUserNotificationsAction);
