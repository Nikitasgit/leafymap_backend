import { IPlaceOwnershipChecker } from "@src/domain/interfaces/IPlaceOwnershipChecker";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { PlaceId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";

class PlaceOwnershipCheckerAdapter implements IPlaceOwnershipChecker {
  constructor(private readonly placeRepository: IPlaceRepository) {}

  async assertOwnedBy(placeId: PlaceId, userId: UserId): Promise<void> {
    const place = await this.placeRepository.findById(placeId);

    if (!place || place.deleted) {
      throw new NotFoundError(ERROR_CODES.PLACE_NOT_FOUND, "Place not found");
    }

    if (!place.belongsTo(userId)) {
      throw new ForbiddenError(
        ERROR_CODES.EVENT_PLACE_FORBIDDEN,
        "You don't have permission to use this place"
      );
    }
  }
}

export default PlaceOwnershipCheckerAdapter;
