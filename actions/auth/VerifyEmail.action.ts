import { IUserRepository } from "@/types/repositories/user.repository.types";
import { hashToken, isTokenExpired } from "@/utils/tokenHash";
import { ERROR_CODES, UnauthorizedError } from "@/utils/errors";

export interface VerifyEmailInput {
  token: string;
}

export interface IVerifyEmailAction {
  execute(params: { verifyData: VerifyEmailInput }): Promise<void>;
}

const INVALID_TOKEN_MESSAGE = "Lien invalide ou expiré.";

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

    if (!user || isTokenExpired(user.emailVerificationExpiresAt)) {
      throw new UnauthorizedError(
        ERROR_CODES.AUTH_INVALID_EMAIL_VERIFICATION_TOKEN,
        INVALID_TOKEN_MESSAGE
      );
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
