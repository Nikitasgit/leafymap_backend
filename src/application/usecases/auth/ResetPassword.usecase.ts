import { ResetPasswordInput } from "@src/application/dtos/auth/resetPassword.dto";
import { IOpaqueTokenFactory } from "@src/domain/interfaces/IOpaqueTokenFactory";
import { IPasswordHasher } from "@src/domain/interfaces/IPasswordHasher";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { ERROR_CODES, UnauthorizedError } from "@src/shared/errors";

const INVALID_TOKEN_MESSAGE =
  "Le lien de réinitialisation est invalide ou a expiré. Veuillez faire une nouvelle demande.";

class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly opaqueTokenFactory: IOpaqueTokenFactory,
    private readonly passwordHasher: IPasswordHasher
  ) {}

  async execute(params: ResetPasswordInput): Promise<void> {
    const { token, newPassword } = params;
    const hashed = this.opaqueTokenFactory.hash(token);
    const user =
      await this.userRepository.findByResetPasswordTokenHash(hashed);

    if (
      !user ||
      this.opaqueTokenFactory.isExpired(user.resetPasswordExpiresAt)
    ) {
      throw new UnauthorizedError(
        ERROR_CODES.AUTH_INVALID_RESET_PASSWORD_TOKEN,
        INVALID_TOKEN_MESSAGE
      );
    }

    const passwordHash = await this.passwordHasher.hash(newPassword);
    await this.userRepository.update(user.setPasswordHash(passwordHash));
  }
}

export default ResetPasswordUseCase;
