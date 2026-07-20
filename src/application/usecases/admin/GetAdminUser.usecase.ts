import { GetAdminUserInput } from "@src/application/dtos/admin/getAdminUser.dto";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserDetailsReadModel } from "@src/domain/read-models/user.read-models";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

class GetAdminUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: GetAdminUserInput): Promise<UserDetailsReadModel> {
    const user = await this.userRepository.findDetailsById(
      UserId.from(params.userId),
      {
        includeDeleted: true,
        view: "admin",
      }
    );

    if (!user) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    return user;
  }
}

export default GetAdminUserUseCase;
