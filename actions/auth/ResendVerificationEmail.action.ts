import { IUserRepository } from "@/types/repositories/user.repository.types";
import EmailService from "@/services/emailService";
import { delay } from "@/utils/delay";
import { generateTokenWithExpiry } from "@/utils/tokenHash";

export interface ResendVerificationEmailInput {
  email: string;
}

export interface IResendVerificationEmailAction {
  execute(params: {
    requestData: ResendVerificationEmailInput;
  }): Promise<void>;
}

class ResendVerificationEmailAction implements IResendVerificationEmailAction {
  private emailService: EmailService;

  constructor(private userRepository: IUserRepository) {
    this.emailService = new EmailService();
  }

  async execute({
    requestData,
  }: {
    requestData: ResendVerificationEmailInput;
  }): Promise<void> {
    const { email } = requestData;

    const user = await this.userRepository.findOne({
      email,
      emailVerified: false,
    });

    if (!user) {
      await delay(100);
      return;
    }

    const { token, tokenHash, expiresAt } = generateTokenWithExpiry();

    await this.userRepository.updateOne(user._id.toString(), {
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: expiresAt,
    });

    await this.emailService.sendEmailVerification(email, token);
  }
}

export default ResendVerificationEmailAction;
