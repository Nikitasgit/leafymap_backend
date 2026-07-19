import { IAuthEmailSender } from "@src/domain/interfaces/IAuthEmailSender";
import EmailService from "@src/infrastructure/services/emailService";

class AuthEmailSenderAdapter implements IAuthEmailSender {
  private readonly emailService = new EmailService();

  async sendEmailVerification(email: string, token: string): Promise<void> {
    await this.emailService.sendEmailVerification(email, token);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    await this.emailService.sendPasswordResetEmail(email, token);
  }
}

export default AuthEmailSenderAdapter;
