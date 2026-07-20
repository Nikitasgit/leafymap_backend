import {
  SignInInput,
  SignInOutput,
} from "@src/application/dtos/auth/signIn.dto";
import { IJwtTokenIssuer } from "@src/domain/interfaces/IJwtTokenIssuer";
import { IPasswordHasher } from "@src/domain/interfaces/IPasswordHasher";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { ERROR_CODES, UnauthorizedError } from "@src/shared/errors";

class SignInUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly jwtTokenIssuer: IJwtTokenIssuer
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
      },
      token,
    };
  }
}

export default SignInUseCase;
