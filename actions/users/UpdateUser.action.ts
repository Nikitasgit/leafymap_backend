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
      role,
      bannedAt,
      banReason,
      banDuration,
      banExpiresAt,
      lastLogin,
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
    if (
      sanitizedData.preferences !== undefined &&
      (sanitizedData.preferences === null ||
        typeof sanitizedData.preferences !== "object")
    ) {
      throw new Error("Invalid user preferences");
    }
    if (
      sanitizedData.preferences?.emailNotifications !== undefined &&
      typeof sanitizedData.preferences.emailNotifications !== "boolean"
    ) {
      throw new Error("Invalid email notification preference");
    }

    await this.userRepository.updateOne(userId, sanitizedData);

    if (sanitizedData.userType) {
      const user = await this.userRepository.findById(userId, [
        "_id",
        "userType",
        "role",
      ]);
      if (user) {
        const token = generateToken({
          id: user._id.toString(),
          userType: user.userType,
          role: user.role,
        });
        return { token };
      }
    }
    return {};
  }
}

export default UpdateUserAction;
