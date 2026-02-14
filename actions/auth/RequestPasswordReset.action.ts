import { IUserRepository } from "@/types/repositories/user.repository.types";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import EmailService from "@/services/emailService";

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
      await new Promise((resolve) => setTimeout(resolve, 100));
      return;
    }

    const token = randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(token, 10);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    const storedValue = `${expiresAt.getTime()}:${hashedToken}`;

    await this.userRepository.updateOne(user._id.toString(), {
      resetPasswordToken: storedValue,
    });

    const frontendUrl = process.env.FRONTEND_URL;
    const userId = user._id.toString();
    const resetUrl = `${frontendUrl}/auth/reset-password?id=${userId}&token=${token}`;

    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        token,
        resetUrl,
      );
    } catch (error) {
      await this.userRepository.updateOne(user._id.toString(), {
        $unset: { resetPasswordToken: 1 },
      });
      throw error;
    }
  }
}

export default RequestPasswordResetAction;
