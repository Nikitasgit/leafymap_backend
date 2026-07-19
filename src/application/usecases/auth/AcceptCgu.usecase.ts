import { AcceptCguInput } from "@src/application/dtos/auth/acceptCgu.dto";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

class AcceptCguUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: AcceptCguInput): Promise<void> {
    const userId = UserId.from(params.userId);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    await this.userRepository.update(user.acceptCgu(params.emailNotifications));
  }
}

export default AcceptCguUseCase;
