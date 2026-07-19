import { IImageReferenceOwnershipChecker } from "@src/domain/interfaces/IImageReferenceOwnershipChecker";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";
import { ImageReferenceType } from "@src/domain/value-objects/ImageReferenceType.vo";
import {
  EventId,
  PlaceId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import {
  ERROR_CODES,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "@src/shared/errors";

class ImageReferenceOwnershipCheckerAdapter
  implements IImageReferenceOwnershipChecker
{
  constructor(
    private readonly placeRepository: IPlaceRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async assertOwnedBy(
    referenceId: ReferenceId,
    referenceType: ImageReferenceType,
    userId: UserId
  ): Promise<void> {
    switch (referenceType) {
      case "Place": {
        const place = await this.placeRepository.findById(
          PlaceId.from(referenceId)
        );
        if (!place) {
          throw new NotFoundError(
            ERROR_CODES.PLACE_NOT_FOUND,
            `La place avec l'ID ${referenceId} n'existe pas`
          );
        }
        if (!place.belongsTo(userId)) {
          throw new ForbiddenError(
            ERROR_CODES.IMAGE_FORBIDDEN,
            "Vous n'êtes pas autorisé à uploader des images pour cette référence"
          );
        }
        return;
      }

      case "Event": {
        const event = await this.eventRepository.findById(
          EventId.from(referenceId)
        );
        if (!event) {
          throw new NotFoundError(
            ERROR_CODES.EVENT_NOT_FOUND,
            `L'événement avec l'ID ${referenceId} n'existe pas`
          );
        }
        if (event.ownerId !== userId) {
          throw new ForbiddenError(
            ERROR_CODES.IMAGE_FORBIDDEN,
            "Vous n'êtes pas autorisé à uploader des images pour cette référence"
          );
        }
        return;
      }

      case "User": {
        if (referenceId.toString() !== userId.toString()) {
          throw new ForbiddenError(
            ERROR_CODES.IMAGE_FORBIDDEN,
            "Vous n'êtes pas autorisé à uploader des images pour cette référence"
          );
        }
        return;
      }

      case "Comment":
      case "Review": {
        throw new ValidationError(
          {
            referenceType: `Type de référence '${referenceType}' non encore implémenté`,
          },
          ERROR_CODES.IMAGE_REFERENCE_UNSUPPORTED,
          `Type de référence '${referenceType}' non encore implémenté`
        );
      }

      default: {
        const _exhaustive: never = referenceType;
        throw new ValidationError(
          { referenceType: `Type de référence invalide: ${_exhaustive}` },
          ERROR_CODES.VALIDATION_ERROR,
          "Type de référence invalide"
        );
      }
    }
  }
}

export default ImageReferenceOwnershipCheckerAdapter;
