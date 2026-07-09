import { IUserRepository } from "@/types/repositories/user.repository.types";
import { generateToken } from "@/utils/jwt";
import { getBanMessage, isBanActive } from "@/utils/ban";
import { ERROR_CODES, ForbiddenError, UnauthorizedError } from "@/utils/errors";
import bcrypt from "bcrypt";

export interface SignInInput {
  identifier: string;
  password: string;
}

export interface ISignInAction {
  execute(params: {
    signInData: SignInInput;
  }): Promise<{ user: any; token: string }>;
}

class SignInAction implements ISignInAction {
  constructor(private userRepository: IUserRepository) {}

  async execute({
    signInData,
  }: {
    signInData: SignInInput;
  }): Promise<{ user: any; token: string }> {
    const { identifier, password } = signInData;

    const user = await this.userRepository.findOne(
      { $or: [{ email: identifier }, { username: identifier }] },
      [
        "_id",
        "email",
        "username",
        "password",
        "userType",
        "role",
        "deleted",
        "emailVerified",
        "bannedAt",
        "banReason",
        "banExpiresAt",
      ]
    );

    if (!user) {
      throw new UnauthorizedError(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        "Les identifiants sont incorrects"
      );
    }
    if (!password || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedError(
        ERROR_CODES.AUTH_INVALID_CREDENTIALS,
        "Les identifiants sont incorrects"
      );
    }

    if (user.emailVerified === false) {
      throw new ForbiddenError(
        ERROR_CODES.AUTH_EMAIL_NOT_VERIFIED,
        "Veuillez vérifier votre adresse email avant de vous connecter. Consultez votre boîte de réception ou demandez un nouveau lien."
      );
    }
    if (user.deleted) {
      throw new ForbiddenError(
        ERROR_CODES.AUTH_ACCOUNT_INACCESSIBLE,
        "Ce compte n'est plus accessible"
      );
    }
    if (isBanActive(user)) {
      throw new ForbiddenError(ERROR_CODES.AUTH_USER_BANNED, getBanMessage(user));
    }

    await this.userRepository.updateOne(user._id.toString(), {
      lastLogin: new Date(),
    });

    const token = generateToken({
      id: user._id.toString(),
      userType: user.userType,
      role: user.role,
    });

    return {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        userType: user.userType,
        role: user.role,
      },
      token,
    };
  }
}

export default SignInAction;
