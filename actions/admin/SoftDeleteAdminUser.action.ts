import { IUserRepository } from "@/types/repositories/user.repository.types";

export interface ISoftDeleteAdminUserAction {
  execute(params: {
    adminId: string;
    userId: string;
    deleted: boolean;
  }): Promise<void>;
}

class SoftDeleteAdminUserAction implements ISoftDeleteAdminUserAction {
  constructor(private userRepository: IUserRepository) {}

  async execute({
    adminId,
    userId,
    deleted,
  }: {
    adminId: string;
    userId: string;
    deleted: boolean;
  }): Promise<void> {
    if (adminId === userId) {
      throw new Error("You cannot delete your own admin account");
    }

    const user = await this.userRepository.findById(userId, ["_id"]);
    if (!user) {
      throw new Error("User not found");
    }

    await this.userRepository.updateOne(userId, { deleted });
  }
}

export default SoftDeleteAdminUserAction;
