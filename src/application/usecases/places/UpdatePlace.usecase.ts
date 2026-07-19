import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import {
  PlaceCategoryId,
  PlaceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { PlaceLocation } from "@src/domain/value-objects/PlaceLocation.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";
import { UpdatePlaceInput } from "@src/application/dtos/places/updatePlace.dto";

class UpdatePlaceUseCase {
  constructor(private readonly placeRepository: IPlaceRepository) {}

  async execute(params: UpdatePlaceInput): Promise<void> {
    const placeId = PlaceId.from(params.placeId);
    const userId = UserId.from(params.userId);

    const existing = await this.placeRepository.findById(placeId);
    if (!existing || existing.deleted) {
      throw new NotFoundError(
        ERROR_CODES.PLACE_NOT_FOUND,
        "Place not found"
      );
    }

    if (!existing.belongsTo(userId)) {
      throw new ForbiddenError(
        ERROR_CODES.PLACE_FORBIDDEN,
        "You don't have permission to update this place"
      );
    }

    const updated = existing.updateDetails({
      location: params.location
        ? PlaceLocation.from(params.location)
        : undefined,
      placeCategoryId: params.placeCategoryId
        ? PlaceCategoryId.from(params.placeCategoryId)
        : undefined,
      defaultSchedule: params.defaultSchedule,
      customDates: params.customDates,
    });

    await this.placeRepository.update(updated);
  }
}

export default UpdatePlaceUseCase;
