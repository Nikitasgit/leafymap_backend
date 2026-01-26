import NotificationService from "@/services/notificationService";

export interface IGetCurrentUserNotificationsAction {
  execute(params: { userId: string }): Promise<{ messages: number }>;
}

class GetCurrentUserNotificationsAction
  implements IGetCurrentUserNotificationsAction
{
  constructor(private notificationService: NotificationService) {}

  async execute({
    userId,
  }: {
    userId: string;
  }): Promise<{ messages: number }> {
    const unreadConversationsCount =
      await this.notificationService.countUserUnreadConversations(userId);

    return {
      messages: unreadConversationsCount,
    };
  }
}

export default GetCurrentUserNotificationsAction;
