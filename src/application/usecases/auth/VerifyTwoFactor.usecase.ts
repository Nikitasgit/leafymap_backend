import {
  VerifyTwoFactorInput,
  VerifyTwoFactorOutput,
} from "@src/application/dtos/auth/verifyTwoFactor.dto";
import { User } from "@src/domain/entities/User.entity";
import { IJwtTokenIssuer } from "@src/domain/interfaces/IJwtTokenIssuer";
import { IOpaqueTokenFactory } from "@src/domain/interfaces/IOpaqueTokenFactory";
import { ITwoFactorService } from "@src/domain/interfaces/ITwoFactorService";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { ERROR_CODES, UnauthorizedError } from "@src/shared/errors";

class VerifyTwoFactorUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly twoFactorService: ITwoFactorService,
    private readonly opaqueTokenFactory: IOpaqueTokenFactory,
    private readonly jwtTokenIssuer: IJwtTokenIssuer
  ) {}

  async execute(params: VerifyTwoFactorInput): Promise<VerifyTwoFactorOutput> {
    const challengeHash = this.opaqueTokenFactory.hash(params.challengeToken);
    const user =
      await this.userRepository.findByTwoFactorChallengeHash(challengeHash);

    if (
      !user ||
      !user.totpEnabled ||
      !user.totpSecret ||
      this.opaqueTokenFactory.isExpired(user.twoFactorChallengeExpiresAt)
    ) {
      throw new UnauthorizedError(
        ERROR_CODES.AUTH_TWO_FACTOR_CHALLENGE_INVALID,
        "Two-factor challenge is invalid or expired"
      );
    }

    user.assertCanAuthenticate();

    const totpValid = this.twoFactorService.verifyTotp(
      params.code,
      user.totpSecret
    );
    const recoveryHash = this.twoFactorService.hashRecoveryCode(params.code);
    const recoveryValid = user.recoveryCodeHashes.includes(recoveryHash);

    if (!totpValid && !recoveryValid) {
      throw new UnauthorizedError(
        ERROR_CODES.AUTH_TWO_FACTOR_INVALID_CODE,
        "Invalid authentication code"
      );
    }

    let nextUser: User = user.clearTwoFactorChallenge().recordLogin();
    if (recoveryValid) {
      nextUser = nextUser.consumeRecoveryCode(recoveryHash);
    }

    await this.userRepository.update(nextUser);

    const token = this.jwtTokenIssuer.issue({
      id: user.id!,
      userType: user.userType,
      role: user.role,
    });

    return {
      user: {
        id: user.id!,
        email: user.email,
        username: user.username,
        userType: user.userType,
        role: user.role,
        acceptedAt: user.acceptedAt,
        twoFactorEnabled: user.totpEnabled,
      },
      token,
    };
  }
}

export default VerifyTwoFactorUseCase;
