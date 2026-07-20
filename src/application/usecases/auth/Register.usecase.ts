import {
  RegisterInput,
  RegisterOutput,
} from "@src/application/dtos/auth/register.dto";
import { User } from "@src/domain/entities/User.entity";
import { IAuthEmailSender } from "@src/domain/interfaces/IAuthEmailSender";
import { IOpaqueTokenFactory } from "@src/domain/interfaces/IOpaqueTokenFactory";
import { IPasswordHasher } from "@src/domain/interfaces/IPasswordHasher";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { ConflictError, ERROR_CODES } from "@src/shared/errors";

class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly opaqueTokenFactory: IOpaqueTokenFactory,
    private readonly authEmailSender: IAuthEmailSender
  ) {}

  async execute(params: RegisterInput): Promise<RegisterOutput> {
    const { email, password, acceptedCGU, emailNotifications } = params;
    const { token, tokenHash, expiresAt } = this.opaqueTokenFactory.generate();

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      if (existingUser.emailVerified !== false) {
        throw new ConflictError(
          ERROR_CODES.AUTH_EMAIL_ALREADY_USED,
          "Cet email est déjà utilisé"
        );
      }

      const refreshed = existingUser
        .setEmailVerificationToken(tokenHash, expiresAt)
        .withEmailNotificationPreference(emailNotifications === true);
      await this.userRepository.update(refreshed);
      await this.authEmailSender.sendEmailVerification(email, token);
      return { id: existingUser.id! };
    }

    const passwordHash = await this.passwordHasher.hash(password);
    const user = User.register({
      email,
      passwordHash,
      acceptedCGU,
      emailNotifications,
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: expiresAt,
    });

    const userId = await this.userRepository.create(user);
    await this.authEmailSender.sendEmailVerification(email, token);

    return { id: userId };
  }
}

export default RegisterUseCase;
