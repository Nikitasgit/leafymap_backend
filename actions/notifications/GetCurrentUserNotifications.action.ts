import NotificationService from "@/services/notificationService";
import { NotificationWithSender } from "@/types/repositories/notification.repository.types";

export type GetCurrentUserNotificationsResult = {
  notifications: NotificationWithSender[];
  unreadConversations: number;
};

export interface IGetCurrentUserNotificationsAction {
  execute(params: {
    userId: string;
  }): Promise<GetCurrentUserNotificationsResult>;
}

class GetCurrentUserNotificationsAction
  implements IGetCurrentUserNotificationsAction
{
  constructor(private notificationService: NotificationService) {}

  async execute({
    userId,
  }: {
    userId: string;
  }): Promise<GetCurrentUserNotificationsResult> {
    const [notifications, unreadConversations] = await Promise.all([
      this.notificationService.findAllForUser(userId, { limit: 50 }),
      this.notificationService.countUserUnreadConversations(userId),
    ]);

    return { notifications, unreadConversations };
  }
}

export default GetCurrentUserNotificationsAction;
