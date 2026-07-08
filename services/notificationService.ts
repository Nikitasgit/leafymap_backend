import { Types } from "mongoose";
import { IConversationRepository } from "@/types/repositories/conversation.repository.types";
import { IMessageRepository } from "@/types/repositories/message.repository.types";
import { IUserRepository } from "@/types/repositories/user.repository.types";
import {
  INotificationRepository,
  NotificationFilters,
  NotificationWithSender,
} from "@/types/repositories/notification.repository.types";
import {
  NotificationReferenceType,
  NotificationActionType,
} from "@/types/models/notification";
import EmailService from "@/services/emailService";
import logger from "@/utils/logger";

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
  "sender.googlePictureUrl",
];

interface EmailNotificationThrottleRule {
  windowMs: number;
  scope: {
    sender?: boolean;
    reference?: boolean;
    referenceType?: boolean;
  };
}

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

const EMAIL_NOTIFICATION_THROTTLE_RULES: Partial<
  Record<NotificationActionType, EmailNotificationThrottleRule>
> = {
  message: {
    windowMs: FIFTEEN_MINUTES_MS,
    scope: {
      sender: true,
      referenceType: true,
    },
  },
};

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
    private notificationRepository: INotificationRepository,
    private userRepository: IUserRepository,
    private emailService: EmailService
  ) {}

  async createNotification(
    params: CreateNotificationParams
  ): Promise<Types.ObjectId> {
    const { sender, receiver, action, reference, referenceType } = params;
    const notificationId = await this.notificationRepository.create({
      sender: new Types.ObjectId(sender),
      receiver: new Types.ObjectId(receiver),
      action,
      reference: new Types.ObjectId(reference),
      referenceType,
    });
    await this.sendNotificationThroughChannels(params, notificationId);
    return notificationId;
  }

  private async sendNotificationThroughChannels(
    notification: CreateNotificationParams,
    notificationId: Types.ObjectId
  ): Promise<void> {
    await this.sendNotificationEmail(notification, notificationId);
  }

  private async sendNotificationEmail(
    notification: CreateNotificationParams,
    notificationId: Types.ObjectId
  ): Promise<void> {
    try {
      const shouldSendEmail = await this.shouldSendNotificationEmail(
        notification,
        notificationId
      );
      if (!shouldSendEmail) {
        return;
      }

      const [receiver, sender] = await Promise.all([
        this.userRepository.findById(notification.receiver, [
          "email",
          "preferences.emailNotifications",
        ]),
        this.userRepository.findById(notification.sender, [
          "username",
          "firstname",
          "lastname",
        ]),
      ]);

      if (!receiver?.email) {
        return;
      }

      if (receiver.preferences?.emailNotifications !== true) {
        return;
      }

      await this.emailService.sendNotificationEmail({
        email: receiver.email,
        action: notification.action,
        senderName: this.getNotificationSenderName(sender),
      });
    } catch (error) {
      logger.error("Error sending notification through email channel:", error);
    }
  }

  private async shouldSendNotificationEmail(
    notification: CreateNotificationParams,
    notificationId: Types.ObjectId
  ): Promise<boolean> {
    const throttleRule = EMAIL_NOTIFICATION_THROTTLE_RULES[notification.action];
    if (!throttleRule) {
      return true;
    }

    const filters: NotificationFilters = {
      _id: { $ne: notificationId },
      receiver: notification.receiver,
      action: notification.action,
      createdAt: {
        $gte: new Date(Date.now() - throttleRule.windowMs),
      },
    };

    if (throttleRule.scope.sender) {
      filters.sender = new Types.ObjectId(notification.sender);
    }

    if (throttleRule.scope.reference) {
      filters.reference = new Types.ObjectId(notification.reference);
    }

    if (throttleRule.scope.referenceType) {
      filters.referenceType = notification.referenceType;
    }

    const recentNotifications = await this.notificationRepository.findAll({
      filters,
      project: ["_id"],
      limit: 1,
    });

    return recentNotifications.length === 0;
  }

  private getNotificationSenderName(
    sender: Awaited<ReturnType<IUserRepository["findById"]>>
  ): string | undefined {
    if (!sender) {
      return undefined;
    }
    return (
      sender.username ||
      [sender.firstname, sender.lastname].filter(Boolean).join(" ").trim() ||
      undefined
    );
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
