import { IUser } from "@/types/models/user";
import { IUserRepository } from "@/types/repositories/user.repository.types";

export interface IGetAdminUserAction {
  execute(params: { userId: string }): Promise<IUser>;
}

class GetAdminUserAction implements IGetAdminUserAction {
  private readonly project: (keyof IUser | string)[] = [
    "_id",
    "email",
    "username",
    "firstname",
    "lastname",
    "userType",
    "role",
    "deleted",
    "bannedAt",
    "banReason",
    "banDuration",
    "banExpiresAt",
    "lastLogin",
    "createdAt",
    "updatedAt",
    "place",
    "image.urls",
  ];

  constructor(private userRepository: IUserRepository) {}

  async execute({ userId }: { userId: string }): Promise<IUser> {
    const user = await this.userRepository.findById(userId, this.project);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}

export default GetAdminUserAction;
