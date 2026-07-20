import { GetUserProfileInput } from "@src/application/dtos/users/getUserProfile.dto";
import type GetPlaceByIdUseCase from "@src/application/usecases/places/GetPlaceById.usecase";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { UserDetailsReadModel } from "@src/domain/read-models/user.read-models";
import { UserId } from "@src/domain/value-objects/ObjectId.vo";
import { ERROR_CODES, NotFoundError } from "@src/shared/errors";

const extractId = (value: unknown): string | null => {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object" && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
};

class GetUserProfileUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly getPlaceByIdUseCase: GetPlaceByIdUseCase
  ) {}

  async execute(params: GetUserProfileInput): Promise<{
    user: UserDetailsReadModel;
    place: Awaited<ReturnType<GetPlaceByIdUseCase["execute"]>> | null;
  }> {
    const user = await this.userRepository.findDetailsById(
      UserId.from(params.userId),
      { view: "profile" }
    );

    if (!user) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    const placeId = extractId(user.place);
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
