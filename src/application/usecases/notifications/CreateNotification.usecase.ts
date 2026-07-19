import { CreateNotificationInput } from "@src/application/dtos/notifications/createNotification.dto";
import { Notification } from "@src/domain/entities/Notification.entity";
import { User } from "@src/domain/entities/User.entity";
import { INotificationEmailSender } from "@src/domain/interfaces/INotificationEmailSender";
import { INotificationRepository } from "@src/domain/interfaces/INotificationRepository";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { NotificationAction } from "@src/domain/value-objects/NotificationAction.vo";
import { NotificationReferenceType } from "@src/domain/value-objects/NotificationReferenceType.vo";
import {
  NotificationId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import logger from "@src/shared/logger";

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
  Record<NotificationAction, EmailNotificationThrottleRule>
> = {
  message: {
    windowMs: FIFTEEN_MINUTES_MS,
    scope: {
      sender: true,
      referenceType: true,
    },
  },
};

class CreateNotificationUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly userRepository: IUserRepository,
    private readonly notificationEmailSender: INotificationEmailSender
  ) {}

  async execute(input: CreateNotificationInput): Promise<NotificationId> {
    const senderId = UserId.from(input.senderId);
    const receiverId = UserId.from(input.receiverId);
    const action = NotificationAction.from(input.action);
    const referenceId = ReferenceId.from(input.referenceId);
    const referenceType = NotificationReferenceType.from(input.referenceType);

    const notificationId = await this.notificationRepository.save(
      Notification.create({
        senderId,
        receiverId,
        action,
        referenceId,
        referenceType,
      })
    );

    await this.sendNotificationEmail(
      { senderId, receiverId, action, referenceId, referenceType },
      notificationId
    );

    return notificationId;
  }

  private async sendNotificationEmail(
    notification: {
      senderId: UserId;
      receiverId: UserId;
      action: NotificationAction;
      referenceId: ReferenceId;
      referenceType: NotificationReferenceType;
    },
    notificationId: NotificationId
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
        this.userRepository.findById(notification.receiverId),
        this.userRepository.findById(notification.senderId),
      ]);

      if (!receiver?.email) {
        return;
      }

      if (receiver.preferences.emailNotifications !== true) {
        return;
      }

      await this.notificationEmailSender.sendNotificationEmail({
        email: receiver.email,
        action: notification.action,
        senderName: this.getNotificationSenderName(sender),
      });
    } catch (error) {
      logger.error("Error sending notification through email channel:", error);
    }
  }

  private async shouldSendNotificationEmail(
    notification: {
      senderId: UserId;
      receiverId: UserId;
      action: NotificationAction;
      referenceId: ReferenceId;
      referenceType: NotificationReferenceType;
    },
    notificationId: NotificationId
  ): Promise<boolean> {
    const throttleRule = EMAIL_NOTIFICATION_THROTTLE_RULES[notification.action];
    if (!throttleRule) {
      return true;
    }

    const hasRecent = await this.notificationRepository.existsRecentSimilar({
      excludeId: notificationId,
      receiverId: notification.receiverId,
      action: notification.action,
      since: new Date(Date.now() - throttleRule.windowMs),
      senderId: throttleRule.scope.sender ? notification.senderId : undefined,
      referenceId: throttleRule.scope.reference
        ? notification.referenceId
        : undefined,
      referenceType: throttleRule.scope.referenceType
        ? notification.referenceType
        : undefined,
    });

    return !hasRecent;
  }

  private getNotificationSenderName(sender: User | null): string | undefined {
    if (!sender) {
      return undefined;
    }
    return (
      sender.username ||
      [sender.firstname, sender.lastname].filter(Boolean).join(" ").trim() ||
      undefined
    );
  }
}

export default CreateNotificationUseCase;
