import { ImageReferenceType } from "@src/domain/value-objects/ImageReferenceType.vo";
import { ReferenceId, UserId } from "@src/domain/value-objects/ObjectId.vo";

export interface IImageReferenceOwnershipChecker {
  assertOwnedBy(
    referenceId: ReferenceId,
    referenceType: ImageReferenceType,
    userId: UserId
  ): Promise<void>;
}
