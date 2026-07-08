import { IUserRepository } from "@/types/repositories/user.repository.types";
import { generateToken } from "@/utils/jwt";
import { getBanMessage, isBanActive } from "@/utils/ban";
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
      throw new Error("Les identifiants sont incorrects");
    }
    if (!password || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Les identifiants sont incorrects");
    }

    if (user.emailVerified === false) {
      throw new Error(
        "Veuillez vérifier votre adresse email avant de vous connecter. Consultez votre boîte de réception ou demandez un nouveau lien."
      );
    }
    if (user.deleted) {
      throw new Error("Ce compte n'est plus accessible");
    }
    if (isBanActive(user)) {
      throw new Error(getBanMessage(user));
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
