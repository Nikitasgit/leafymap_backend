import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import { ReferenceId } from "@src/domain/value-objects/ObjectId.vo";

export interface IReviewRatingUpdater {
  recalculate(
    referenceId: ReferenceId,
    referenceType: ReviewReferenceType
  ): Promise<void>;
}
