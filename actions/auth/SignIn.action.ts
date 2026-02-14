import { IUserRepository } from "@/types/repositories/user.repository.types";
import { generateToken } from "@/utils/jwt";
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

    const user = await this.userRepository.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    const isDev = process.env.NODE_ENV === "development";
    const skipPasswordCheck = isDev;

    if (!user) {
      throw new Error("Les identifiants sont incorrects");
    }
    if (
      !skipPasswordCheck &&
      (!password || !(await bcrypt.compare(password, user.password)))
    ) {
      throw new Error("Les identifiants sont incorrects");
    }

    if (user.emailVerified === false) {
      throw new Error(
        "Veuillez vérifier votre adresse email avant de vous connecter. Consultez votre boîte de réception ou demandez un nouveau lien."
      );
    }

    const userWithoutPassword = await this.userRepository.findById(
      user._id.toString(),
      ["email", "username"]
    );

    if (!userWithoutPassword) {
      throw new Error("User not found");
    }

    const token = generateToken({
      id: user._id.toString(),
      userType: user.userType,
    });

    return {
      user: userWithoutPassword,
      token,
    };
  }
}

export default SignInAction;
