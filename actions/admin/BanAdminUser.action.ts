import { IUserRepository } from "@/types/repositories/user.repository.types";
import { ERROR_CODES, ForbiddenError } from "@/utils/errors";

export interface IBanAdminUserAction {
  ban(params: {
    adminId: string;
    userId: string;
    reason: string;
    duration?: number;
  }): Promise<void>;
  unban(params: { adminId: string; userId: string }): Promise<void>;
}

class BanAdminUserAction implements IBanAdminUserAction {
  constructor(private userRepository: IUserRepository) {}

  async ban({
    adminId,
    userId,
    reason,
    duration,
  }: {
    adminId: string;
    userId: string;
    reason: string;
    duration?: number;
  }): Promise<void> {
    if (adminId === userId) {
      throw new ForbiddenError(
        ERROR_CODES.ADMIN_SELF_BAN_FORBIDDEN,
        "You cannot ban your own admin account"
      );
    }

    const bannedAt = new Date();
    const banExpiresAt = duration
      ? new Date(bannedAt.getTime() + duration)
      : undefined;

    await this.userRepository.updateOne(userId, {
      bannedAt,
      banReason: reason,
      banDuration: duration,
      banExpiresAt,
    });
  }

  async unban({
    adminId,
    userId,
  }: {
    adminId: string;
    userId: string;
  }): Promise<void> {
    if (adminId === userId) {
      throw new ForbiddenError(
        ERROR_CODES.ADMIN_SELF_UNBAN_FORBIDDEN,
        "You cannot unban your own admin account"
      );
    }

    await this.userRepository.updateOne(userId, {
      $unset: {
        bannedAt: 1,
        banReason: 1,
        banDuration: 1,
        banExpiresAt: 1,
      },
    });
  }
}

export default BanAdminUserAction;
