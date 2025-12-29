import { IUserRepository } from "../../repositories/users/IUserRepository";
import { Types } from "mongoose";
import bcrypt from "bcrypt";

export interface RegisterInput {
  email: string;
  password: string;
  acceptedCGU: boolean;
}

export interface IRegisterAction {
  execute(params: { registerData: RegisterInput }): Promise<{ _id: string }>;
}

class RegisterAction implements IRegisterAction {
  constructor(private userRepository: IUserRepository) {}

  async execute({
    registerData,
  }: {
    registerData: RegisterInput;
  }): Promise<{ _id: string }> {
    const { email, password, acceptedCGU } = registerData;

    const emailExists = await this.userRepository.findOne({ email });
    if (emailExists) {
      throw new Error("Cet email est déjà utilisé");
    }

    const hashed = await bcrypt.hash(password, 10);

    const userId = await this.userRepository.create({
      email,
      password: hashed,
      acceptedCGU,
      acceptedAt: new Date(),
      userType: "guest",
      deleted: false,
    });

    return { _id: userId.toString() };
  }
}

export default RegisterAction;
