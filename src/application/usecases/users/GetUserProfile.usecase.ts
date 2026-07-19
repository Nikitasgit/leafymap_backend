import { GetUserProfileInput } from "@src/application/dtos/users/getUserProfile.dto";
import type GetPlaceByIdUseCase from "@src/application/usecases/places/GetPlaceById.usecase";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";
import { toId } from "@src/shared/mongoose";

const USER_PROJECT = [
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
  "image.urls",
  "googlePictureUrl",
  "userCategory.name",
  "userCategory.type",
  "userCategory.type.name",
];

class GetUserProfileUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly getPlaceByIdUseCase: GetPlaceByIdUseCase
  ) {}

  async execute(params: GetUserProfileInput): Promise<{
    user: Record<string, unknown>;
    place: Awaited<ReturnType<GetPlaceByIdUseCase["execute"]>> | null;
  }> {
    const user = await this.userRepository.findDetailsById(
      UserId.from(params.userId),
      { project: USER_PROJECT }
    );

    if (!user) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    const placeId = toId(user.place as Parameters<typeof toId>[0]);
    const place = placeId
      ? await this.getPlaceByIdUseCase.execute({
          placeId,
          scheduleWithEvents: true,
        })
      : null;

    return { user, place };
  }
}

export default GetUserProfileUseCase;
