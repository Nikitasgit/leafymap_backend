import { ReviewReferenceType } from "@src/domain/value-objects/ReviewReferenceType.vo";
import { ReferenceId, UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface IReviewTargetChecker {
  exists(
    referenceId: ReferenceId,
    referenceType: ReviewReferenceType
  ): Promise<boolean>;
  getOwnerId(
    referenceId: ReferenceId,
    referenceType: ReviewReferenceType
  ): Promise<UserId | null>;
}
