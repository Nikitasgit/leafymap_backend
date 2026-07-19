import { VerifyEmailInput } from "@src/application/dtos/auth/verifyEmail.dto";
import { IOpaqueTokenFactory } from "@src/domain/interfaces/IOpaqueTokenFactory";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { ERROR_CODES, UnauthorizedError } from "@src/shared/errors";

const INVALID_TOKEN_MESSAGE = "Lien invalide ou expiré.";

class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly opaqueTokenFactory: IOpaqueTokenFactory
  ) {}

  async execute(params: VerifyEmailInput): Promise<void> {
    const hashed = this.opaqueTokenFactory.hash(params.token);
    const user =
      await this.userRepository.findByEmailVerificationTokenHash(hashed);

    if (
      !user ||
      this.opaqueTokenFactory.isExpired(user.emailVerificationExpiresAt)
    ) {
      throw new UnauthorizedError(
        ERROR_CODES.AUTH_INVALID_EMAIL_VERIFICATION_TOKEN,
        INVALID_TOKEN_MESSAGE
      );
    }

    await this.userRepository.update(user.verifyEmail());
  }
}

export default VerifyEmailUseCase;
