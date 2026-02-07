import { Types } from "mongoose";
import { IConversationRepository } from "@/types/repositories/conversation.repository.types";
import { IMessageRepository } from "@/types/repositories/message.repository.types";
import {
  INotificationRepository,
  NotificationWithSender,
} from "@/types/repositories/notification.repository.types";
import {
  NotificationReferenceType,
  NotificationActionType,
} from "@/types/models/notification";

const NOTIFICATION_LIST_PROJECT: (
  | keyof import("@/types/models/notification").INotification
  | string
)[] = [
  "_id",
  "action",
  "reference",
  "referenceType",
  "read",
  "readAt",
  "createdAt",
  "updatedAt",
  "sender",
  "sender.username",
  "sender.firstname",
  "sender.lastname",
  "sender.image",
  "sender.image.urls",
];

export interface CreateNotificationParams {
  sender: string;
  receiver: string;
  action: NotificationActionType;
  reference: string;
  referenceType: NotificationReferenceType;
}

class NotificationService {
  constructor(
    private conversationRepository: IConversationRepository,
    private messageRepository: IMessageRepository,
    private notificationRepository: INotificationRepository
  ) {}

  async createNotification(
    params: CreateNotificationParams
  ): Promise<Types.ObjectId> {
    const { sender, receiver, action, reference, referenceType } = params;
    const notification = await this.notificationRepository.create({
      sender: new Types.ObjectId(sender),
      receiver: new Types.ObjectId(receiver),
      action,
      reference: new Types.ObjectId(reference),
      referenceType,
    });
    return notification._id;
  }

  async findAllForUser(
    userId: string,
    options?: { limit?: number }
  ): Promise<NotificationWithSender[]> {
    return this.notificationRepository.findAll({
      filters: { receiver: userId },
      project: NOTIFICATION_LIST_PROJECT,
      limit: options?.limit ?? 50,
      sort: { createdAt: -1 },
    });
  }

  async markAsReadByAction(
    action: NotificationActionType,
    receiverId: string
  ): Promise<number> {
    const notifications = await this.notificationRepository.findAll({
      filters: {
        receiver: receiverId,
        action,
        read: { $ne: true },
      },
      project: ["_id"],
    });
    const ids = notifications.map((n) => n._id);
    return this.notificationRepository.markAsRead(ids, receiverId);
  }

  async markAllUserNotificationsAsRead(userId: string): Promise<number> {
    return this.notificationRepository.markAllUserNotificationsAsRead(userId);
  }

  async countUserUnreadConversations(userId: string): Promise<number> {
    let count = 0;
    const userIdObjectId = new Types.ObjectId(userId);

    const conversations = await this.conversationRepository.findAll({
      filters: {
        participants: userId,
      },
      project: ["_id"],
    });

    for (const conversation of conversations) {
      const unreadMessage = await this.messageRepository.findOne({
        conversation: conversation._id.toString(),
        readBy: { $nin: [userIdObjectId] },
        sender: { $ne: userIdObjectId },
      });

      if (unreadMessage) {
        count++;
      }
    }
    return count;
  }
}

export default NotificationService;
