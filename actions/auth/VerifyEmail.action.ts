import { IUserRepository } from "@/types/repositories/user.repository.types";
import { hashToken } from "@/utils/tokenHash";

export interface VerifyEmailInput {
  token: string;
}

export interface IVerifyEmailAction {
  execute(params: { verifyData: VerifyEmailInput }): Promise<void>;
}

class VerifyEmailAction implements IVerifyEmailAction {
  constructor(private userRepository: IUserRepository) {}

  async execute({
    verifyData,
  }: {
    verifyData: VerifyEmailInput;
  }): Promise<void> {
    const { token } = verifyData;
    const hashed = hashToken(token);

    const user = await this.userRepository.findOne({
      emailVerificationTokenHash: hashed,
    });

    if (!user || !user.emailVerificationExpiresAt) {
      throw new Error("Lien invalide ou expiré.");
    }
    if (new Date() > user.emailVerificationExpiresAt) {
      throw new Error("Lien invalide ou expiré.");
    }

    await this.userRepository.updateOne(user._id.toString(), {
      emailVerified: true,
      $unset: {
        emailVerificationTokenHash: 1,
        emailVerificationExpiresAt: 1,
      },
    });
  }
}

export default VerifyEmailAction;
