import {
  SignInInput,
  SignInOutput,
} from "@src/application/dtos/auth/signIn.dto";
import { IJwtTokenIssuer } from "@src/domain/interfaces/IJwtTokenIssuer";
import { IOpaqueTokenFactory } from "@src/domain/interfaces/IOpaqueTokenFactory";
import { IPasswordHasher } from "@src/domain/interfaces/IPasswordHasher";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { ERROR_CODES, UnauthorizedError } from "@src/shared/errors";

const TWO_FACTOR_CHALLENGE_MINUTES = 5;

class SignInUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtTokenIssuer: IJwtTokenIssuer,
    private readonly opaqueTokenFactory: IOpaqueTokenFactory
  ) {}

  async execute(params: SignInInput): Promise<SignInOutput> {
    const { identifier, password } = params;

    const user = await this.userRepository.findByEmailOrUsername(identifier);

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        "Les identifiants sont incorrects"
      );
    }

    if (
      !password ||
      !(await this.passwordHasher.compare(password, user.passwordHash))
    ) {
      throw new UnauthorizedError(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        "Les identifiants sont incorrects"
      );
    }

    user.assertCanAuthenticate({ requireEmailVerified: true });

    if (user.totpEnabled) {
      const challenge = this.opaqueTokenFactory.generate(
        TWO_FACTOR_CHALLENGE_MINUTES
      );
      await this.userRepository.update(
        user.setTwoFactorChallenge(challenge.tokenHash, challenge.expiresAt)
      );
      return {
        twoFactorRequired: true,
        challengeToken: challenge.token,
      };
    }

    const loggedIn = user.recordLogin();
    await this.userRepository.update(loggedIn);

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

export default SignInUseCase;
