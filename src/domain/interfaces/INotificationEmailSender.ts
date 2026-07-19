import { NotificationAction } from "@src/domain/value-objects/NotificationAction.vo";

export interface INotificationEmailSender {
  sendNotificationEmail(params: {
    email: string;
    action: NotificationAction;
    senderName?: string;
  }): Promise<void>;
}
