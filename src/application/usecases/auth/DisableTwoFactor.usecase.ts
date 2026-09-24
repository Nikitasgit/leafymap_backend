import { DisableTwoFactorInput } from "@src/application/dtos/auth/disableTwoFactor.dto";
import { User } from "@src/domain/entities/User.entity";
import { ITwoFactorService } from "@src/domain/interfaces/ITwoFactorService";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ConflictError,
  ERROR_CODES,
  NotFoundError,
  UnauthorizedError,
} from "@src/shared/errors";

class DisableTwoFactorUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly twoFactorService: ITwoFactorService
  ) {}

  async execute(params: DisableTwoFactorInput): Promise<void> {
    const user = await this.userRepository.findById(UserId.from(params.userId));
    if (!user) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    if (!user.totpEnabled || !user.totpSecret) {
      throw new ConflictError(
        ERROR_CODES.AUTH_TWO_FACTOR_NOT_ENABLED,
        "Two-factor authentication is not enabled"
      );
    }

    if (!this.isValidCode(user, params.code)) {
      throw new UnauthorizedError(
        ERROR_CODES.AUTH_TWO_FACTOR_INVALID_CODE,
        "Invalid authentication code"
      );
    }

    await this.userRepository.update(user.disableTotp());
  }

  private isValidCode(user: User, code: string): boolean {
    if (this.twoFactorService.verifyTotp(code, user.totpSecret!)) {
      return true;
    }

    const codeHash = this.twoFactorService.hashRecoveryCode(code);
    return user.recoveryCodeHashes.includes(codeHash);
  }
}

export default DisableTwoFactorUseCase;
