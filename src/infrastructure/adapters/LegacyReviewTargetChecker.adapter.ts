import { IReviewTargetChecker } from "@src/domain/interfaces/IReviewTargetChecker";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import {
  EventId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IPlaceRepository } from "@/types/repositories/place.repository.types";
import { toId } from "@/utils/mongoose";

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
        const event = await this.eventRepository.findById(
          EventId.from(referenceId)
        );
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
        return this.eventRepository.findOwnerId(EventId.from(referenceId));
      }
    }
  }
}

export default LegacyReviewTargetCheckerAdapter;
