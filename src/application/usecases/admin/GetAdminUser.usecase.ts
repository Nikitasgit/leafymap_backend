import { GetAdminUserInput } from "@src/application/dtos/admin/getAdminUser.dto";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

const ADMIN_USER_PROJECT = [
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

class GetAdminUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(params: GetAdminUserInput): Promise<Record<string, unknown>> {
    const user = await this.userRepository.findDetailsById(
      UserId.from(params.userId),
      {
        includeDeleted: true,
        project: ADMIN_USER_PROJECT,
      }
    );

    if (!user) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    return user;
  }
}

export default GetAdminUserUseCase;
