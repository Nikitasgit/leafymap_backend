import { IUserPlaceLinker } from "@src/domain/interfaces/IUserPlaceLinker";
import { IUserRepository } from "@src/domain/interfaces/IUserRepository";
import { PlaceId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ConflictError,
  ERROR_CODES,
  NotFoundError,
} from "@src/shared/errors";

class UserPlaceLinkerAdapter implements IUserPlaceLinker {
  constructor(private readonly userRepository: IUserRepository) {}

  async assertCanCreatePlace(userId: UserId): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user || user.deleted) {
      throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND, "User not found");
    }

    if (user.hasPlace()) {
      throw new ConflictError(
        ERROR_CODES.USER_ALREADY_HAS_PLACE,
        "User already has a place"
      );
    }
  }

  async linkPlace(userId: UserId, placeId: PlaceId): Promise<void> {
    await this.userRepository.linkPlace(userId, placeId);
  }

  async unlinkPlace(userId: UserId): Promise<void> {
    await this.userRepository.unlinkPlace(userId);
  }
}

export default UserPlaceLinkerAdapter;
