import { IUserRepository } from "@/types/repositories/user.repository.types";
import { generateToken } from "@/utils/jwt";
import { IUser } from "@/types/models/user";

export interface IUpdateUserAction {
  execute(params: {
    userId: string;
    updateData: Partial<IUser>;
  }): Promise<{ token: string }>;
}

class UpdateUserAction implements IUpdateUserAction {
  constructor(private userRepository: IUserRepository) {}

  async execute({
    userId,
    updateData,
  }: {
    userId: string;
    updateData: Partial<IUser>;
  }): Promise<{ token: string }> {
    const {
      password,
      email,
      acceptedCGU,
      acceptedAt,
      deleted,
      _id,
      createdAt,
      updatedAt,
      ...sanitizedData
    } = updateData;

    if (sanitizedData.firstname) {
      sanitizedData.firstname = sanitizedData.firstname.toLowerCase().trim();
    }
    if (sanitizedData.lastname) {
      sanitizedData.lastname = sanitizedData.lastname.toLowerCase().trim();
    }

    const updatedUser = await this.userRepository.updateOne(
      userId,
      sanitizedData
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    const token = generateToken({
      id: updatedUser._id,
      userType: updatedUser.userType,
    });

    return { token };
  }
}

export default UpdateUserAction;
