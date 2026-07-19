import { RequestPasswordResetInput } from "@src/application/dtos/auth/requestPasswordReset.dto";
import { IAuthEmailSender } from "@src/domain/interfaces/IAuthEmailSender";
import { IOpaqueTokenFactory } from "@src/domain/interfaces/IOpaqueTokenFactory";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { delay } from "@src/shared/delay";

class RequestPasswordResetUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly opaqueTokenFactory: IOpaqueTokenFactory,
    private readonly authEmailSender: IAuthEmailSender
  ) {}

  async execute(params: RequestPasswordResetInput): Promise<void> {
    const { email } = params;
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      await delay(100);
      return;
    }

    const { token, tokenHash, expiresAt } =
      this.opaqueTokenFactory.generate(60);

    await this.userRepository.update(
      user.setPasswordResetToken(tokenHash, expiresAt)
    );

    try {
      await this.authEmailSender.sendPasswordResetEmail(user.email, token);
    } catch (error) {
      await this.userRepository.update(user.clearPasswordResetToken());
      throw error;
    }
  }
}

export default RequestPasswordResetUseCase;
