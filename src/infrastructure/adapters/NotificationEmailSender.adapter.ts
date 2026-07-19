import { INotificationEmailSender } from "@src/domain/interfaces/INotificationEmailSender";
import { NotificationAction } from "@src/domain/value-objects/NotificationAction.vo";
import EmailService from "@src/infrastructure/services/emailService";

class NotificationEmailSenderAdapter implements INotificationEmailSender {
  private readonly emailService = new EmailService();

  async sendNotificationEmail(params: {
    email: string;
    action: NotificationAction;
    senderName?: string;
  }): Promise<void> {
    await this.emailService.sendNotificationEmail(params);
  }
}

export default NotificationEmailSenderAdapter;
