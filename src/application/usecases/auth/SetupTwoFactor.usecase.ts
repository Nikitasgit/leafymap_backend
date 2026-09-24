import {
  SetupTwoFactorInput,
  SetupTwoFactorOutput,
} from "@src/application/dtos/auth/setupTwoFactor.dto";
import { ITwoFactorService } from "@src/domain/interfaces/ITwoFactorService";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ConflictError,
  ERROR_CODES,
  NotFoundError,
} from "@src/shared/errors";

class SetupTwoFactorUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly twoFactorService: ITwoFactorService
  ) {}

  async execute(params: SetupTwoFactorInput): Promise<SetupTwoFactorOutput> {
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

    const secret = this.twoFactorService.generateSecret();
    await this.userRepository.update(user.startTotpSetup(secret));

    const otpauthUri = this.twoFactorService.generateOtpauthUri(
      user.email,
      secret
    );
    const qrDataUrl = await this.twoFactorService.generateQrDataUrl(otpauthUri);

    return { secret, otpauthUri, qrDataUrl };
  }
}

export default SetupTwoFactorUseCase;
