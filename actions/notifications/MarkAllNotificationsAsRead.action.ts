import NotificationService from "@/services/notificationService";

export interface IMarkAllNotificationsAsReadAction {
  execute(params: { userId: string }): Promise<{ markedCount: number }>;
}

class MarkAllNotificationsAsReadAction
  implements IMarkAllNotificationsAsReadAction
{
  constructor(private notificationService: NotificationService) {}

  async execute({
    userId,
  }: {
    userId: string;
  }): Promise<{ markedCount: number }> {
    const markedCount =
      await this.notificationService.markAllUserNotificationsAsRead(userId);
    return { markedCount };
  }
}

export default MarkAllNotificationsAsReadAction;
