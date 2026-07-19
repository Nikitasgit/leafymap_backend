import { GetUserByIdInput } from "@src/application/dtos/users/getUserById.dto";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

const DEFAULT_PROJECT = [
  "_id",
  "firstname",
  "lastname",
  "username",
  "userType",
  "email",
  "website",
  "phone",
  "description",
  "country",
  "followers",
  "place._id",
  "place.placeCategory.name",
  "place.location",
  "image.urls",
  "googlePictureUrl",
  "userCategory.name",
  "userCategory.type",
  "userCategory.type.name",
];

class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    params: GetUserByIdInput
  ): Promise<Record<string, unknown>> {
    const user = await this.userRepository.findDetailsById(
      UserId.from(params.userId),
      { project: params.project ?? DEFAULT_PROJECT }
    );

    if (!user) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    return user;
  }
}

export default GetUserByIdUseCase;
