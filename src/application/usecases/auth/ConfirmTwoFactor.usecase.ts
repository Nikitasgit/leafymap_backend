import {
  ConfirmTwoFactorInput,
  ConfirmTwoFactorOutput,
} from "@src/application/dtos/auth/confirmTwoFactor.dto";
import { ITwoFactorService } from "@src/domain/interfaces/ITwoFactorService";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ConflictError,
  ERROR_CODES,
  NotFoundError,
  UnauthorizedError,
} from "@src/shared/errors";

class ConfirmTwoFactorUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly twoFactorService: ITwoFactorService
  ) {}

  async execute(
    params: ConfirmTwoFactorInput
  ): Promise<ConfirmTwoFactorOutput> {
    const user = await this.userRepository.findById(UserId.from(params.userId));
    if (!user) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    if (user.totpEnabled) {
      throw new ConflictError(
        ERROR_CODES.AUTH_TWO_FACTOR_ALREADY_ENABLED,
        "Two-factor authentication is already enabled"
      );
    }

    if (!user.totpSecret) {
      throw new ConflictError(
        ERROR_CODES.AUTH_TWO_FACTOR_SETUP_REQUIRED,
        "Two-factor authentication setup is required first"
      );
    }

    if (!this.twoFactorService.verifyTotp(params.code, user.totpSecret)) {
      throw new UnauthorizedError(
        ERROR_CODES.AUTH_TWO_FACTOR_INVALID_CODE,
        "Invalid authentication code"
      );
    }

    const { codes, hashes } = this.twoFactorService.generateRecoveryCodes();
    await this.userRepository.update(user.confirmTotp(hashes));

    return { recoveryCodes: codes };
  }
}

export default ConfirmTwoFactorUseCase;
