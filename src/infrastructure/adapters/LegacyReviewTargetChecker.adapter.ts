import { IReviewTargetChecker } from "@src/domain/interfaces/IReviewTargetChecker";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import { ReferenceId, UserId } from "@src/domain/value-objects/ObjectId.vo";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { IEventRepository } from "@/types/repositories/event.repository.types";
import { resolveOwnerId, toId } from "@/utils/mongoose";

class LegacyReviewTargetCheckerAdapter implements IReviewTargetChecker {
  constructor(
    private readonly placeRepository: IPlaceRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async exists(
    referenceId: ReferenceId,
    referenceType: ReviewReferenceType
  ): Promise<boolean> {
    switch (referenceType) {
      case "Place": {
        const place = await this.placeRepository.findById(referenceId, [
          "_id",
        ]);
        return place !== null;
      }
      case "Event": {
        const event = await this.eventRepository.findById(referenceId, [
          "_id",
        ]);
        return event !== null;
      }
    }
  }

  async getOwnerId(
    referenceId: ReferenceId,
    referenceType: ReviewReferenceType
  ): Promise<UserId | null> {
    switch (referenceType) {
      case "Place": {
        const place = await this.placeRepository.findById(referenceId, [
          "user",
        ]);
        if (!place) {
          return null;
        }
        const ownerId = toId(place.user);
        return ownerId ? UserId.from(ownerId) : null;
      }
      case "Event": {
        const event = await this.eventRepository.findById(referenceId, [
          "user",
          "place",
          "place.user",
        ]);
        if (!event) {
          return null;
        }
        const ownerId = resolveOwnerId(event);
        return ownerId ? UserId.from(ownerId) : null;
      }
    }
  }
}

export default LegacyReviewTargetCheckerAdapter;
