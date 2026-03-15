import { IUserRepository } from "@/types/repositories/user.repository.types";
import EmailService from "@/services/emailService";
import { delay } from "@/utils/delay";
import { generateTokenWithExpiry } from "@/utils/tokenHash";

export interface RequestPasswordResetInput {
  email: string;
}

export interface IRequestPasswordResetAction {
  execute(params: { requestData: RequestPasswordResetInput }): Promise<void>;
}

class RequestPasswordResetAction implements IRequestPasswordResetAction {
  private emailService: EmailService;

  constructor(private userRepository: IUserRepository) {
    this.emailService = new EmailService();
  }

  async execute({
    requestData,
  }: {
    requestData: RequestPasswordResetInput;
  }): Promise<void> {
    const { email } = requestData;

    const user = await this.userRepository.findOne({ email });

    if (!user) {
      await delay(100);
      return;
    }

    const { token, tokenHash, expiresAt } = generateTokenWithExpiry(60);

    await this.userRepository.updateOne(user._id.toString(), {
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpiresAt: expiresAt,
    });

    try {
      await this.emailService.sendPasswordResetEmail(user.email, token);
    } catch (error) {
      await this.userRepository.updateOne(user._id.toString(), {
        $unset: { resetPasswordTokenHash: 1, resetPasswordExpiresAt: 1 },
      });
      throw error;
    }
  }
}

export default RequestPasswordResetAction;
