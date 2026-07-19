import { IReviewTargetChecker } from "@src/domain/interfaces/IReviewTargetChecker";
import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import {
  EventId,
  PlaceId,
  ReferenceId,
  UserId,
} from "@src/domain/value-objects/ObjectId.vo";
import { IEventRepository } from "@src/domain/interfaces/IEventRepository";
import { IPlaceRepository } from "@src/domain/interfaces/IPlaceRepository";

class ReviewTargetCheckerAdapter implements IReviewTargetChecker {
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
        const place = await this.placeRepository.findById(
          PlaceId.from(referenceId)
        );
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
        const place = await this.placeRepository.findById(
          PlaceId.from(referenceId)
        );
        return place ? place.userId : null;
      }
      case "Event": {
        return this.eventRepository.findOwnerId(EventId.from(referenceId));
      }
    }
  }
}

export default ReviewTargetCheckerAdapter;
