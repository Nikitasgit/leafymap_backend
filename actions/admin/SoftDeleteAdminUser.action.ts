import { IUserRepository } from "@/types/repositories/user.repository.types";
import { ERROR_CODES, ForbiddenError, NotFoundError } from "@/utils/errors";

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
      throw new ForbiddenError(
        ERROR_CODES.ADMIN_SELF_DELETE_FORBIDDEN,
        "You cannot delete your own admin account"
      );
    }

    const user = await this.userRepository.findById(userId, ["_id"]);
    if (!user) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    await this.userRepository.updateOne(userId, { deleted });
  }
}

export default SoftDeleteAdminUserAction;
