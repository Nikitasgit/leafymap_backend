import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import { ReferenceId } from "@src/domain/value-objects/ObjectId.vo";

export interface ICommentReferenceChecker {
  exists(
    referenceId: ReferenceId,
    referenceType: CommentReferenceType
  ): Promise<boolean>;
}
