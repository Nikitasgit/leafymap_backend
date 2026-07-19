import { SoftDeleteAdminUserInput } from "@src/application/dtos/admin/softDeleteAdminUser.dto";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, ForbiddenError, NotFoundError } from "@src/shared/errors";

class SoftDeleteAdminUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: SoftDeleteAdminUserInput): Promise<void> {
    if (params.adminId === params.userId) {
      throw new ForbiddenError(
        ERROR_CODES.ADMIN_SELF_DELETE_FORBIDDEN,
        "You cannot delete your own admin account"
      );
    }

    const user = await this.userRepository.findById(UserId.from(params.userId));
    if (!user) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    await this.userRepository.update(user.softDelete());
  }
}

export default SoftDeleteAdminUserUseCase;
