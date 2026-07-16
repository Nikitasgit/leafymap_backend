import { ICommentReferenceChecker } from "@src/domain/interfaces/ICommentReferenceChecker";
import { IReviewRepository } from "@src/domain/interfaces/IReviewRepository";
import { CommentReferenceType } from "@src/domain/value-objects/CommentReferenceType.vo";
import { ReferenceId, ReviewId } from "@src/domain/value-objects/ObjectId.vo";
import { IImageRepository } from "@/types/repositories/image.repository.types";

class LegacyCommentReferenceCheckerAdapter implements ICommentReferenceChecker {
  constructor(
    private readonly imageRepository: IImageRepository,
    private readonly reviewRepository: IReviewRepository
  ) {}

  async exists(
    referenceId: ReferenceId,
    referenceType: CommentReferenceType
  ): Promise<boolean> {
    switch (referenceType) {
      case "Image": {
        const image = await this.imageRepository.findById(referenceId, [
          "_id",
        ]);
        return image !== null;
      }
      case "Review": {
        const review = await this.reviewRepository.findById(
          ReviewId.from(referenceId)
        );
        return review !== null;
      }
      case "Comment":
        return false;
    }
  }
}

export default LegacyCommentReferenceCheckerAdapter;
