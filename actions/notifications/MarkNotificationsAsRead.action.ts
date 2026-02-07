import NotificationService from "@/services/notificationService";
import { NotificationActionType } from "@/types/models/notification";

export interface IMarkNotificationsAsReadAction {
  execute(params: {
    action: NotificationActionType;
    userId: string;
  }): Promise<{ markedCount: number }>;
}

class MarkNotificationsAsReadAction implements IMarkNotificationsAsReadAction {
  constructor(private notificationService: NotificationService) {}

  async execute({
    action,
    userId,
  }: {
    action: NotificationActionType;
    userId: string;
  }): Promise<{ markedCount: number }> {
    const markedCount = await this.notificationService.markAsReadByAction(
      action,
      userId
    );
    return { markedCount };
  }
}

export default MarkNotificationsAsReadAction;
