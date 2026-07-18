import { IPlaceOwnershipChecker } from "@src/domain/interfaces/IPlaceOwnershipChecker";
import { PlaceId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

class LegacyPlaceOwnershipCheckerAdapter implements IPlaceOwnershipChecker {
  constructor(private readonly placeRepository: IPlaceRepository) {}

  async assertOwnedBy(placeId: PlaceId, userId: UserId): Promise<void> {
    const place = await this.placeRepository.findById(placeId, ["user"]);

    if (!place) {
      throw new NotFoundError(ERROR_CODES.PLACE_NOT_FOUND, "Place not found");
    }

    if (place.user.toString() !== userId) {
      throw new ForbiddenError(
        ERROR_CODES.EVENT_PLACE_FORBIDDEN,
        "You don't have permission to use this place"
      );
    }
  }
}

export default LegacyPlaceOwnershipCheckerAdapter;
