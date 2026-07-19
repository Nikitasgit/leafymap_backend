import { ResendVerificationEmailInput } from "@src/application/dtos/auth/resendVerificationEmail.dto";
import { IAuthEmailSender } from "@src/domain/interfaces/IAuthEmailSender";
import { IOpaqueTokenFactory } from "@src/domain/interfaces/IOpaqueTokenFactory";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { delay } from "@src/shared/delay";

class ResendVerificationEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly opaqueTokenFactory: IOpaqueTokenFactory,
    private readonly authEmailSender: IAuthEmailSender
  ) {}

  async execute(params: ResendVerificationEmailInput): Promise<void> {
    const { email } = params;
    const user = await this.userRepository.findByEmail(email);

    if (!user || user.emailVerified !== false) {
      await delay(100);
      return;
    }

    const { token, tokenHash, expiresAt } = this.opaqueTokenFactory.generate();
    await this.userRepository.update(
      user.setEmailVerificationToken(tokenHash, expiresAt)
    );
    await this.authEmailSender.sendEmailVerification(email, token);
  }
}

export default ResendVerificationEmailUseCase;
