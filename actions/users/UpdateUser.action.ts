import { IUserRepository } from "@/types/repositories/user.repository.types";
import { generateToken } from "@/utils/jwt";
import { IUser } from "@/types/models/user";

export interface IUpdateUserAction {
  execute(params: {
    userId: string;
    updateData: Partial<IUser>;
  }): Promise<{ token?: string }>;
}

class UpdateUserAction implements IUpdateUserAction {
  constructor(private userRepository: IUserRepository) {}

  async execute({
    userId,
    updateData,
  }: {
    userId: string;
    updateData: Partial<IUser>;
  }): Promise<{ token?: string }> {
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

  await this.userRepository.updateOne(userId, sanitizedData);

    if (sanitizedData.userType) {
      const user = await this.userRepository.findById(userId, [
        "_id",
        "userType",
      ]);
      if (user) {
        const token = generateToken({
          id: user._id.toString(),
          userType: user.userType,
        });
        return { token };
      }
    }
    return {};
  }
}

export default UpdateUserAction;
