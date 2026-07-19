import { BanAdminUserInput } from "@src/application/dtos/admin/banAdminUser.dto";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, ForbiddenError } from "@src/shared/errors";

class BanAdminUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: BanAdminUserInput): Promise<void> {
    if (params.adminId === params.userId) {
      throw new ForbiddenError(
        ERROR_CODES.ADMIN_SELF_BAN_FORBIDDEN,
        "You cannot ban your own admin account"
      );
    }

    const user = await this.userRepository.findById(UserId.from(params.userId));
    if (!user) {
      return;
    }

    await this.userRepository.update(
      user.ban({ reason: params.reason, duration: params.duration })
    );
  }
}

export default BanAdminUserUseCase;
