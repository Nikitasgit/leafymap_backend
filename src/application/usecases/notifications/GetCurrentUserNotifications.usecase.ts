import { GetCurrentUserNotificationsInput } from "@src/application/dtos/notifications/getCurrentUserNotifications.dto";
import {
  INotificationRepository,
  NotificationListItem,
} from "@src/domain/interfaces/INotificationRepository";
import { IUnreadConversationCounter } from "@src/domain/interfaces/IUnreadConversationCounter";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";

export type GetCurrentUserNotificationsResult = {
  notifications: NotificationListItem[];
  unreadConversations: number;
};

class GetCurrentUserNotificationsUseCase {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly unreadConversationCounter: IUnreadConversationCounter
  ) {}

  async execute(
    params: GetCurrentUserNotificationsInput
  ): Promise<GetCurrentUserNotificationsResult> {
    const userId = UserId.from(params.userId);
    const [notifications, unreadConversations] = await Promise.all([
      this.notificationRepository.findRecentForReceiver(userId, { limit: 50 }),
      this.unreadConversationCounter.countForUser(userId),
    ]);

    return { notifications, unreadConversations };
  }
}

export default GetCurrentUserNotificationsUseCase;
