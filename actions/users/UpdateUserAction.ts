import { IUserRepository } from "../../repositories/users/IUserRepository";
import { generateToken } from "../../utils/jwt";
import { IUser } from "../../types/models/user";

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
    await this.userRepository.updateOne(userId, updateData);

    const updatedUser = await this.userRepository.findById(userId, [
      "_id",
      "userType",
    ]);

    if (!updatedUser) {
      throw new Error("User not found");
    }

    const token = generateToken({
      id: updatedUser._id.toString(),
      userType: updatedUser.userType,
    });

    return { token };
  }
}

export default UpdateUserAction;
