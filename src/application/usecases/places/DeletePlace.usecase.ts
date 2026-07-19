import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { IUserPlaceLinker } from "@src/domain/interfaces/IUserPlaceLinker";
import { PlaceId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
} from "@src/shared/errors";
import { DeletePlaceInput } from "@src/application/dtos/places/deletePlace.dto";
import { ICascadeDeleter } from "@src/domain/interfaces/ICascadeDeleter";
import logger from "@src/shared/logger";

class DeletePlaceUseCase {
  constructor(
    private readonly placeRepository: IPlaceRepository,
    private readonly userPlaceLinker: IUserPlaceLinker,
    private readonly cascadeDeleter: ICascadeDeleter
  ) {}

  async execute(params: DeletePlaceInput): Promise<void> {
    const placeId = PlaceId.from(params.placeId);
    const userId = UserId.from(params.userId);

    const existing = await this.placeRepository.findById(placeId);
    if (!existing || !existing.id) {
      throw new NotFoundError(
        ERROR_CODES.PLACE_NOT_FOUND,
        "Place not found"
      );
    }

    if (!existing.belongsTo(userId)) {
      throw new ForbiddenError(
        ERROR_CODES.PLACE_FORBIDDEN,
        "You don't have permission to delete this place"
      );
    }

    await this.cascadeDeleter.deletePlace(existing.id);
    await this.userPlaceLinker.unlinkPlace(existing.userId);

    logger.info(
      `Place ${existing.id} and associated data deleted successfully`
    );
  }
}

export default DeletePlaceUseCase;
